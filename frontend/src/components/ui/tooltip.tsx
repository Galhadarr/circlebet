"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactElement,
} from "react";
import { createPortal } from "react-dom";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function Tooltip({
  content,
  children,
  side = "top",
}: {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom";
}) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const isClient = useIsClient();

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setCoords({
      top: side === "bottom" ? rect.bottom + 8 : rect.top,
      left: rect.left + rect.width / 2,
    });
  }, [side]);

  const show = useCallback(() => {
    updatePosition();
    setOpen(true);
  }, [updatePosition]);

  const hide = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;
    const onFocusIn = () => show();
    const onFocusOut = (e: FocusEvent) => {
      const next = e.relatedTarget as Node | null;
      if (next && el.contains(next)) return;
      if (typeof el.matches === "function" && el.matches(":hover")) return;
      hide();
    };
    el.addEventListener("focusin", onFocusIn);
    el.addEventListener("focusout", onFocusOut);
    return () => {
      el.removeEventListener("focusin", onFocusIn);
      el.removeEventListener("focusout", onFocusOut);
    };
  }, [show, hide]);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const handler = () => updatePosition();
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
  }, [open, updatePosition]);

  const transform =
    side === "bottom" ? "translateX(-50%)" : "translate(-50%, calc(-100% - 8px))";

  const triggerChild = Children.only(children);
  const triggerEl = isValidElement(triggerChild)
    ? cloneElement(triggerChild as ReactElement<{ title?: string }>, {
        title: undefined,
      })
    : triggerChild;

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-flex shrink-0 items-center"
        onMouseEnter={show}
        onMouseLeave={hide}
      >
        {triggerEl}
      </span>
      {isClient &&
        open &&
        createPortal(
          <span
            role="tooltip"
            style={{
              position: "fixed",
              left: coords.left,
              top: coords.top,
              transform,
            }}
            className="pointer-events-none z-[200] w-max max-w-[min(14rem,calc(100vw-3rem))] rounded-lg border border-border bg-bg-primary px-3 py-2 text-left text-xs leading-snug text-text-primary shadow-xl"
          >
            {content}
          </span>,
          document.body
        )}
    </>
  );
}
