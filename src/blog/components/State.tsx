export function State({ text, tone }: { text: string; tone?: "error" }) {
  return <div className={`state ${tone || ""}`}>{text}</div>;
}
