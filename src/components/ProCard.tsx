"use client";

import { useRouter } from "next/navigation";
import type { Professional } from "@/lib/data";
import { useQuote } from "./QuoteProvider";
import {
  ProfileMediaCard,
  ProfilePillButton,
} from "./ProfileMediaCard";

type ProCardProps = {
  pro: Professional;
};

export function ProCard({ pro }: ProCardProps) {
  const router = useRouter();
  const { addItem } = useQuote();

  function requestQuote() {
    addItem({ id: `pro:${pro.id}`, name: pro.name, kind: "pro" });
    router.push(`/quotes?pro=${encodeURIComponent(pro.id)}`);
  }

  return (
    <ProfileMediaCard
      image={pro.avatar}
      imageAlt={pro.name}
      title={pro.name}
      subtitle={pro.about}
      certified={pro.certified}
      verified={pro.verified}
      stats={[
        { icon: "group", label: "Reviews", value: pro.reviews },
        {
          icon: "photo_library",
          label: "Portfolio",
          value: Math.max(pro.portfolio.length, pro.projects),
        },
      ]}
      secondaryAction={
        <ProfilePillButton href={`/pros/${pro.id}`} variant="ghost">
          Portfolio
        </ProfilePillButton>
      }
      primaryAction={
        <ProfilePillButton onClick={requestQuote} variant="solid">
          Request Quote +
        </ProfilePillButton>
      }
    />
  );
}
