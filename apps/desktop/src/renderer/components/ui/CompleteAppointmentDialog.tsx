import { useEffect, useState } from "react";
import { useDemoWorkflow } from "../../demo/DemoWorkflowContext";

export default function CompleteAppointmentDialog() {
  const {
    completeDialogOpen,
    closeCompleteDialog,
    completeAppointment,
    detailApptId,
    appointments
  } = useDemoWorkflow();

  const appt = appointments.find((a) => a.id === detailApptId);

  const [amount, setAmount] = useState("0");
  const [method, setMethod] = useState("Contanti");
  const [products, setProducts] = useState("Crema lenitiva post");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (completeDialogOpen && appt) {
      setAmount(String(appt.price));
      setMethod("Contanti");
      setProducts("Crema lenitiva post");
      setNotes("");
    }
  }, [completeDialogOpen, appt]);

  if (!completeDialogOpen) return null;

  return (
    <div className="nb-dialogRoot isOpen" role="presentation">
      <button
        type="button"
        className="nb-dialogBackdrop"
        aria-label="Chiudi"
        onClick={closeCompleteDialog}
      />
      <div className="nb-dialogCard" role="dialog" aria-modal="true" aria-label="Completa appuntamento">
        <h2 className="nb-dialogTitle">Completa appuntamento</h2>
        <p className="nb-dialogSub">
          {appt ? `${appt.client} · ${appt.service}` : "Demo UI"}
        </p>

        <form
          className="nb-drawerForm"
          onSubmit={(e) => {
            e.preventDefault();
            completeAppointment({
              amount: Number(amount) || 0,
              paymentMethod: method,
              products,
              notes
            });
          }}
        >
          <label className="nb-drawerField">
            <span className="nb-drawerFieldLabel">Importo</span>
            <input
              className="nb-drawerInput"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
            />
          </label>

          <label className="nb-drawerField">
            <span className="nb-drawerFieldLabel">Metodo pagamento</span>
            <select
              className="nb-drawerSelect"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              <option>Contanti</option>
              <option>Carta</option>
              <option>Bonifico</option>
              <option>Gift card</option>
            </select>
          </label>

          <label className="nb-drawerField">
            <span className="nb-drawerFieldLabel">Prodotti utilizzati</span>
            <input
              className="nb-drawerInput"
              value={products}
              onChange={(e) => setProducts(e.target.value)}
            />
          </label>

          <label className="nb-drawerField">
            <span className="nb-drawerFieldLabel">Note</span>
            <textarea
              className="nb-drawerTextarea"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Esito trattamento…"
            />
          </label>

          <div className="nb-dialogActions">
            <button type="button" className="nb-ghostBtn" onClick={closeCompleteDialog}>
              Annulla
            </button>
            <button type="submit" className="nb-newBtn">
              Conferma
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
