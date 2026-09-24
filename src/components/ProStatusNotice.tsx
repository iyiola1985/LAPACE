"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { ProProfile } from "@/lib/auth";
import { Icon } from "@/components/Icon";

function noticeKey(proId: string, status: ProProfile["status"]) {
  return `lapace-pro-status-notice:${proId}:${status}`;
}

function wasDismissed(proId: string, status: ProProfile["status"]) {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(noticeKey(proId, status)) === "1";
}

function dismiss(proId: string, status: ProProfile["status"]) {
  window.localStorage.setItem(noticeKey(proId, status), "1");
}

type ProStatusNoticeProps = {
  pro: ProProfile;
};

export function ProStatusNotice({ pro }: ProStatusNoticeProps) {
  const [visible, setVisible] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (pro.status === "pending") {
      setVisible(false);
      return;
    }
    setVisible(!wasDismissed(pro.id, pro.status));
  }, [pro.id, pro.status]);

  if (!visible || pro.status === "pending") return null;

  const approved = pro.status === "verified";
  const className = approved
    ? "mt-6 border border-status-success/40 bg-status-success/10 p-5"
    : "mt-6 border border-status-urgent/40 bg-status-urgent/10 p-5";

  const body = (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 flex-1 gap-3">
        <Icon
          name={approved ? "verified" : "error"}
          className={
            approved
              ? "text-2xl text-status-success"
              : "text-2xl text-status-urgent"
          }
        />
        <div>
          <h2
            className={
              approved
                ? "font-bold uppercase tracking-wide text-status-success"
                : "font-bold uppercase tracking-wide text-status-urgent"
            }
          >
            {approved
              ? "Approved by Lapace Admin"
              : "Application not approved"}
          </h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            {approved
              ? "Your company is now Lapace Certified. You can message clients, submit offers, post work available, and take deals on-site."
              : pro.rejectionReason
                ? `Admin note: ${pro.rejectionReason}`
                : "Update your company profile and portfolio, then wait for admin re-review."}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          dismiss(pro.id, pro.status);
          setVisible(false);
        }}
        className={
          approved
            ? "bg-status-success px-4 py-2 text-xs font-bold uppercase tracking-wide text-white"
            : "bg-status-urgent px-4 py-2 text-xs font-bold uppercase tracking-wide text-white"
        }
      >
        Got it
      </button>
    </div>
  );

  if (reduceMotion) {
    return (
      <section role="status" className={className}>
        {body}
      </section>
    );
  }

  return (
    <motion.section
      role="status"
      className={className}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {body}
    </motion.section>
  );
}
