import clsx from "clsx";

export const COMING_SOON_MESSAGE = "Funzionalità disponibile in una prossima versione.";

type ComingSoonToggleProps = {
  label: string;
  className?: string;
  onInform: (message: string) => void;
  /** Optional wider track (Notification Center quiet style). */
  showLabel?: boolean;
};

/**
 * Switch non operativo per feature non ancora disponibili.
 * Non cambia stato, non genera errori: solo messaggio informativo.
 */
export default function ComingSoonToggle({
  label,
  className,
  onInform,
  showLabel
}: ComingSoonToggleProps) {
  return (
    <button
      type="button"
      className={clsx("nb-ncToggle", "isComingSoon", className)}
      aria-label={`${label} · Coming Soon`}
      aria-pressed={false}
      aria-disabled={true}
      title={COMING_SOON_MESSAGE}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onInform(COMING_SOON_MESSAGE);
      }}
    >
      <span className="nb-ncToggleKnob" />
      {showLabel ? <span className="nb-ncToggleLabel">OFF</span> : null}
    </button>
  );
}
