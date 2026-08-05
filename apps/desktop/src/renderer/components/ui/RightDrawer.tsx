import { X } from "lucide-react";
import type { ReactNode } from "react";
import clsx from "clsx";

type RightDrawerProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
};

export default function RightDrawer({
  open,
  title,
  subtitle,
  onClose,
  children,
  wide
}: RightDrawerProps) {
  return (
    <div className={clsx("nb-drawerRoot", open && "isOpen")} aria-hidden={!open}>
      <button type="button" className="nb-drawerBackdrop" aria-label="Chiudi" onClick={onClose} />
      <aside
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
