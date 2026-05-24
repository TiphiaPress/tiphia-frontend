import logoUrl from "../assets/logo.png";

export function Brand({ subtitle }: { subtitle: string }) {
  return (
    <div className="brand">
      <img className="brand-logo" src={logoUrl} alt="Tiphia" />
      <div>
        <strong>Tiphia</strong>
        <span>{subtitle}</span>
      </div>
    </div>
  );
}
