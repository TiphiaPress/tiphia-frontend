export function Brand({ subtitle }: { subtitle: string }) {
  return (
    <div className="brand">
      <img className="brand-logo" src="/brand/logo.png" alt="Tiphia" />
      <div>
        <strong>Tiphia</strong>
        <span>{subtitle}</span>
      </div>
    </div>
  );
}
