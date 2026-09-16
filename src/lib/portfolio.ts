import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type PortfolioItem = {
  id: string;
  proId: string;
  imageUrl: string;
  storagePath: string;
  title: string;
  description: string;
  position: number;
  createdAt: string;
};

export type PortfolioRow = {
  id: string;
  pro_id: string;
  image_url: string;
  storage_path: string;
  title: string;
  description: string;
  position: number;
  created_at: string;
};

const PORTFOLIO_BUCKET = "pro-portfolios";
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function portfolioFromRow(row: PortfolioRow): PortfolioItem {
  return {
    id: row.id,
    proId: row.pro_id,
    imageUrl: row.image_url,
    storagePath: row.storage_path,
    title: row.title,
    description: row.description,
    position: row.position,
    createdAt: row.created_at,
  };
}

function titleFromFile(file: File) {
  return file.name
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .trim();
}

function extensionFromFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension && /^[a-z0-9]+$/.test(extension)) return extension;
  return file.type === "image/jpeg" ? "jpg" : file.type.replace("image/", "");
}

export async function listPortfolio(proId: string): Promise<PortfolioItem[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("pro_portfolio")
    .select("*")
    .eq("pro_id", proId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as PortfolioRow[] | null)?.map(portfolioFromRow) ?? [];
}

export async function uploadPortfolioImages(
  proId: string,
  files: File[],
): Promise<PortfolioItem[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase is required for portfolio uploads.");
  }

  const existing = await listPortfolio(proId);
  const uploaded: PortfolioItem[] = [];

  for (const [index, file] of files.entries()) {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      throw new Error(`${file.name} is not a supported image.`);
    }
    if (file.size > MAX_IMAGE_SIZE) {
      throw new Error(`${file.name} is larger than 10 MB.`);
    }

    const storagePath = `${proId}/${crypto.randomUUID()}.${extensionFromFile(file)}`;
    const { error: uploadError } = await supabase.storage
      .from(PORTFOLIO_BUCKET)
      .upload(storagePath, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw new Error(uploadError.message);

    const { data: publicUrl } = supabase.storage
      .from(PORTFOLIO_BUCKET)
      .getPublicUrl(storagePath);

    const { data, error: insertError } = await supabase
      .from("pro_portfolio")
      .insert({
        pro_id: proId,
        image_url: publicUrl.publicUrl,
        storage_path: storagePath,
        title: titleFromFile(file) || "Roofing project",
        description: "",
        position: existing.length + index,
      })
      .select("*")
      .single();

    if (insertError || !data) {
      await supabase.storage.from(PORTFOLIO_BUCKET).remove([storagePath]);
      throw new Error(insertError?.message ?? "Could not save portfolio image.");
    }

    uploaded.push(portfolioFromRow(data as PortfolioRow));
  }

  return uploaded;
}

export async function deletePortfolioItem(item: PortfolioItem) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase is required to delete portfolio images.");
  }

  const { error: rowError } = await supabase
    .from("pro_portfolio")
    .delete()
    .eq("id", item.id)
    .eq("pro_id", item.proId);

  if (rowError) throw new Error(rowError.message);

  const { error: storageError } = await supabase.storage
    .from(PORTFOLIO_BUCKET)
    .remove([item.storagePath]);

  if (storageError) throw new Error(storageError.message);
}
