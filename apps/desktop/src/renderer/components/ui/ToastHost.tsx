import { Check } from "lucide-react";
import { useDemoWorkflow } from "../../demo/DemoWorkflowContext";

export default function ToastHost() {
  const { toasts, dismissToast } = useDemoWorkflow();

  if (toasts.length === 0) return null;

  return (
    <div className="nb-toastHost" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="nb-toast" role="status">
          <span className="nb-toastIcon" aria-hidden={true}>
            <Check className="nb-toastIconSvg" />
          </span>
          <span className="nb-toastMsg">{t.message}</span>
          <button type="button" className="nb-toastDismiss" onClick={() => dismissToast(t.id)}>
            Chiudi
          </button>
        </div>
      ))}
    </div>
  );
}
