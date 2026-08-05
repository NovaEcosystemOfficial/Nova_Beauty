type WorkspacePlaceholderProps = {
  title: string;
  hint?: string;
};

export default function WorkspacePlaceholder({
  title,
  hint = "Workspace in arrivo — solo shell UI."
}: WorkspacePlaceholderProps) {
  return (
    <div className="nb-wsPlaceholder">
      <div className="nb-wsPlaceholderInner">
        <h2 className="nb-wsPlaceholderTitle">{title}</h2>
        <p className="nb-wsPlaceholderHint">{hint}</p>
      </div>
    </div>
  );
}
