import { type FormEvent, useEffect, useMemo, useState } from "react";
import type { ConfigSchema } from "../types";

interface Props {
  schema: ConfigSchema;
  value: Record<string, unknown>;
  onSubmit: (value: Record<string, unknown>) => Promise<void> | void;
  submitLabel?: string;
}

export function ConfigForm({ schema, value, onSubmit, submitLabel = "保存配置" }: Props) {
  const initial = useMemo(() => {
    return Object.fromEntries(
      schema.fields.map((field) => [field.key, value[field.key] ?? field.default ?? ""]),
    );
  }, [schema, value]);
  const [draft, setDraft] = useState<Record<string, unknown>>(initial);
  const [jsonDraft, setJsonDraft] = useState<Record<string, string>>(() => jsonTextFromDraft(schema, initial));
  const [jsonErrors, setJsonErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setDraft(initial);
    setJsonDraft(jsonTextFromDraft(schema, initial));
    setJsonErrors({});
  }, [initial, schema]);

  function setValue(key: string, next: unknown) {
    setDraft((current) => ({ ...current, [key]: next }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (Object.keys(jsonErrors).length > 0) {
      return;
    }
    const parsedJson = Object.fromEntries(
      schema.fields
        .filter((field) => field.field_type === "json")
        .map((field) => [field.key, JSON.parse(jsonDraft[field.key] || "null")]),
    );
    await onSubmit({ ...draft, ...parsedJson });
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      {schema.fields.map((field) => {
        const current = draft[field.key];
        return (
          <label className="field" key={field.key}>
            <span>
              {field.label}
              {field.required ? <em>*</em> : null}
            </span>
            {field.field_type === "boolean" ? (
              <input
                type="checkbox"
                checked={Boolean(current)}
                onChange={(event) => setValue(field.key, event.target.checked)}
              />
            ) : field.field_type === "number" ? (
              <input
                type="number"
                value={String(current ?? "")}
                onChange={(event) => setValue(field.key, Number(event.target.value))}
              />
            ) : field.field_type === "textarea" ? (
              <textarea
                rows={5}
                value={String(current ?? "")}
                onChange={(event) => setValue(field.key, event.target.value)}
              />
            ) : field.field_type === "json" ? (
              <>
                <textarea
                  rows={7}
                  value={jsonDraft[field.key] ?? ""}
                  onChange={(event) => {
                    const nextText = event.target.value;
                    setJsonDraft((currentDraft) => ({ ...currentDraft, [field.key]: nextText }));
                    try {
                      JSON.parse(nextText);
                      setJsonErrors((errors) => {
                        const next = { ...errors };
                        delete next[field.key];
                        return next;
                      });
                    } catch (error) {
                      setJsonErrors((errors) => ({
                        ...errors,
                        [field.key]: error instanceof Error ? error.message : "Invalid JSON",
                      }));
                    }
                  }}
                />
                {jsonErrors[field.key] ? <small className="error-text">{jsonErrors[field.key]}</small> : null}
              </>
            ) : (
              <input
                value={String(current ?? "")}
                onChange={(event) => setValue(field.key, event.target.value)}
              />
            )}
            {field.help ? <small>{field.help}</small> : null}
          </label>
        );
      })}
      <div className="form-actions">
        <button type="submit" disabled={Object.keys(jsonErrors).length > 0}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function jsonTextFromDraft(schema: ConfigSchema, draft: Record<string, unknown>) {
  return Object.fromEntries(
    schema.fields
      .filter((field) => field.field_type === "json")
      .map((field) => [field.key, JSON.stringify(draft[field.key] ?? field.default ?? {}, null, 2)]),
  );
}
