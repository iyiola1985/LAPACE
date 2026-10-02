"use client";

import { useRouter } from "next/navigation";
import type { Professional } from "@/lib/data";
import { useQuote } from "./QuoteProvider";
import {
  ProfileMediaCard,
  ProfilePillButton,
} from "./ProfileMediaCard";

type ProCardCompactProps = {
  pro: Professional;
};

export function ProCardCompact({ pro }: ProCardCompactProps) {
  const router = useRouter();
  const { addItem } = useQuote();

  function requestQuote() {
    addItem({ id: `pro:${pro.id}`, name: pro.name, kind: "pro" });
    router.push(`/quotes?pro=${encodeURIComponent(pro.id)}`);
  }

  return (
    <ProfileMediaCard
      className="min-w-[280px] snap-start md:min-w-[320px]"
      aspectClassName="aspect-[4/5] h-full min-h-[360px]"
      image={pro.avatar}
      imageAlt={pro.name}
      title={pro.name}
      subtitle={pro.specialty || pro.about}
      certified={pro.certified}
      verified={pro.verified}
      stats={[
        { icon: "star", label: "Rating", value: pro.rating },
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
