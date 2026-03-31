"use client";

import { HiOutlinePhone, HiOutlineCreditCard } from "react-icons/hi2";

interface TelephonyEmptyStateProps {
  onBuyNumber?: () => void;
}

export function TelephonyEmptyState({ onBuyNumber }: TelephonyEmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4 text-center max-w-md">
        <div className="p-3 rounded-full bg-primary/10">
          <HiOutlinePhone className="size-8 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Phone Number Yet
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Purchase a phone number to enable inbound and outbound calling for
            your voice agent.
          </p>
        </div>
        <button
          onClick={onBuyNumber}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          <HiOutlineCreditCard className="size-4" />
          Buy Phone Number
        </button>
      </div>
    </div>
  );
}
