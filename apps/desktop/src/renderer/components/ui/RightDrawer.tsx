import { X } from "lucide-react";
import clsx from "clsx";
import { useEffect, useRef, type ReactNode } from "react";

type RightDrawerProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
  /** Stack layer: higher = on top of other drawers */
  layer?: number;
  /** When false, ESC does not close (parent under a stacked drawer) */
  escEnabled?: boolean;
  /** Skip autofocus (rare) */
  autoFocus?: boolean;
};

export default function RightDrawer({
  open,
  title,
  subtitle,
  onClose,
  children,
  wide,
  layer = 1,
  escEnabled = true,
  autoFocus = true
}: RightDrawerProps) {
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open || !escEnabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      onClose();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, escEnabled, onClose]);

  useEffect(() => {
    if (!open || !autoFocus) return;
    const id = window.requestAnimationFrame(() => {
      const el = panelRef.current?.querySelector<HTMLElement>(
        "input:not([readonly]):not([disabled]), textarea:not([disabled]), select:not([disabled])"
      );
      el?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [open, autoFocus]);

  return (
    <div
      className={clsx("nb-drawerRoot", open && "isOpen")}
      style={{ zIndex: 8000 + layer * 20 }}
      aria-hidden={!open}
    >
      <button
        type="button"
        className="nb-drawerBackdrop"
        aria-label="Chiudi"
        onClick={onClose}
      />
      <aside
        ref={panelRef}
        className={clsx("nb-drawerPanel", wide && "isWide", open && "isOpen")}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="nb-drawerHead">
          <div>
            <h2 className="nb-drawerTitle">{title}</h2>
            {subtitle ? <p className="nb-drawerSub">{subtitle}</p> : null}
          </div>
          <button type="button" className="nb-drawerClose" onClick={onClose} aria-label="Chiudi">
            <X className="nb-drawerCloseIcon" aria-hidden={true} />
          </button>
        </header>
        <div className="nb-drawerBody">{children}</div>
      </aside>
    </div>
  );
}
