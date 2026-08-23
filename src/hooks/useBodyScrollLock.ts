"use client";

import { useEffect } from "react";

// Module-level reference count so nested/stacked overlays (cart drawer over
// mobile filters, quick view over product page, etc.) never unlock body
// scroll while another overlay is still open.
let lockCount = 0;

function acquire() {
  lockCount += 1;
  if (lockCount === 1 && typeof document !== "undefined") {
    document.body.style.overflow = "hidden";
  }
}

function release() {
  if (lockCount > 0) {
    lockCount -= 1;
  }
  if (lockCount === 0 && typeof document !== "undefined") {
    document.body.style.overflow = "unset";
  }
}

/**
 * Locks body scroll while `locked` is true. Safe across multiple
 * simultaneous consumers; the lock is only released when the last one
 * stops asking for it.
 */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    acquire();
    return () => {
      release();
    };
  }, [locked]);
}
