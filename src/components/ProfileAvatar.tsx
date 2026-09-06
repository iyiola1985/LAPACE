"use client";

import { useRef, useState } from "react";
import { Icon } from "./Icon";
import { ProfilePhotoEditor } from "./ProfilePhotoEditor";

type ProfileAvatarProps = {
  name: string;
  avatarUrl?: string;
  size?: "md" | "lg";
  editable?: boolean;
  onChange?: (dataUrl: string) => void;
};

function initialsFromName(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function ProfileAvatar({
  name,
  avatarUrl,
  size = "lg",
  editable = false,
  onChange,
}: ProfileAvatarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [draftSrc, setDraftSrc] = useState<string | null>(null);
  const dimension = size === "lg" ? "h-24 w-24" : "h-14 w-14";
  const textSize = size === "lg" ? "text-2xl" : "text-lg";

  function handleFileChange(file: File | undefined) {
    if (!file || !onChange) return;
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Image must be under 8MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      if (!result) {
        setError("Could not read that image.");
        return;
      }
      setDraftSrc(result);
      setEditorOpen(true);
    };
    reader.onerror = () => setError("Could not read that image.");
    reader.readAsDataURL(file);
  }

  function handleSave(cropped: string) {
    onChange?.(cropped);
    setEditorOpen(false);
    setDraftSrc(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleCancel() {
    setEditorOpen(false);
    setDraftSrc(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <>
      <div className="flex flex-col items-start gap-2">
        <div className={`relative ${dimension}`}>
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={`${name} profile`}
              className={`${dimension} rounded-full border-2 border-border-subtle object-cover`}
            />
          ) : (
            <div
              className={`${dimension} flex items-center justify-center rounded-full bg-primary text-white ${textSize} font-bold`}
            >
              {initialsFromName(name) || "LA"}
            </div>
          )}

          {editable ? (
            <>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-surface-dark text-white shadow-md hover:bg-primary"
                aria-label="Edit profile picture"
              >
                <Icon name="photo_camera" className="text-[18px]" />
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => handleFileChange(event.target.files?.[0])}
              />
            </>
          ) : null}
        </div>
        {error ? <p className="text-xs text-status-urgent">{error}</p> : null}
        {editable ? (
          <p className="text-xs text-on-surface-variant">
            Tap the camera to upload, then crop to fit
          </p>
        ) : null}
      </div>

      <ProfilePhotoEditor
        open={editorOpen}
        imageSrc={draftSrc}
        onCancel={handleCancel}
        onSave={handleSave}
      />
    </>
  );
}
