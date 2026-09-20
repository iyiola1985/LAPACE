import type { ProProfile, UserProfile } from "@/lib/auth";

export const PENDING_PRO_MESSAGE =
  "Your pro account is under review. Lapace must verify your company before you can message clients, post work, or send offers.";

export const REJECTED_PRO_MESSAGE =
  "Your pro application was not approved. Update your profile and wait for admin re-review, or contact Lapace support.";

export const UNVERIFIED_PRO_BLOCK =
  "Only Lapace-verified pros can use marketplace messaging and offers.";

export function isVerifiedPro(
  user: UserProfile | null | undefined,
): user is ProProfile {
  return user?.role === "pro" && user.status === "verified";
}

export function isPendingPro(user: UserProfile | null | undefined) {
  return user?.role === "pro" && user.status === "pending";
}

export function isRejectedPro(user: UserProfile | null | undefined) {
  return user?.role === "pro" && user.status === "rejected";
}

export function assertVerifiedPro(user: UserProfile | null | undefined) {
  if (!user || user.role !== "pro") {
    throw new Error("Only registered pros can perform this action.");
  }
  if (user.status === "pending") {
    throw new Error(PENDING_PRO_MESSAGE);
  }
  if (user.status === "rejected") {
    throw new Error(REJECTED_PRO_MESSAGE);
  }
  if (user.status !== "verified") {
    throw new Error(UNVERIFIED_PRO_BLOCK);
  }
}

export function marketplaceLockMessage(user: UserProfile | null | undefined) {
  if (!user || user.role !== "pro") return null;
  switch (user.status) {
    case "verified":
      return null;
    case "pending":
      return PENDING_PRO_MESSAGE;
    case "rejected":
      return REJECTED_PRO_MESSAGE;
    default: {
      const _exhaustive: never = user.status;
      return String(_exhaustive);
    }
  }
}
