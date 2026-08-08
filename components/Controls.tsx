"use client";

import { useId } from "react";
import type { Locale } from "@/lib/i18n";
import type { Control, Params } from "@/lib/sim";

type Props = {
  controls: Control[];
  params: Params;
  locale: Locale;
  onChange: (patch: Params, resets: boolean) => void;
};

/** De bedieningspanelen, opgebouwd uit de schema's die elk stuk aanlevert. */
export function Controls({ controls, params, locale, onChange }: Props) {
  return (
    <div className="controls">
      {controls.map((control) => (
        <ControlRow
          key={control.key}
          control={control}
          params={params}
          locale={locale}
          onChange={onChange}
        />
      ))}
    </div>
  );
}

function ControlRow({
  control,
  params,
  locale,
  onChange,
}: {
  control: Control;
  params: Params;
  locale: Locale;
  onChange: (patch: Params, resets: boolean) => void;
}) {
  const id = useId();
  const label = control.label[locale];

  if (control.kind === "slider") {
    const value =
      typeof params[control.key] === "number"
        ? (params[control.key] as number)
        : control.min;

    return (
      <div className="control">
        <div className="control-head">
          <label className="control-label" htmlFor={id}>
            {label}
          </label>
          <output className="control-value" htmlFor={id}>
            {control.format
              ? control.format(value, locale)
              : formatNumber(value, locale)}
          </output>
        </div>
        <input
          id={id}
          className="control-range"
          type="range"
          min={control.min}
          max={control.max}
          step={control.step}
          value={value}
          onChange={(event) =>
            onChange(
              { [control.key]: Number(event.target.value) },
              control.resets ?? false,
            )
          }
        />
      </div>
    );
  }

  if (control.kind === "select") {
    const value =
      typeof params[control.key] === "string"
        ? (params[control.key] as string)
        : (control.options[0]?.value ?? "");

    return (
      <div className="control">
        <div className="control-head">
          <span className="control-label" id={id}>
            {label}
          </span>
        </div>
        <div className="control-chips" role="group" aria-labelledby={id}>
          {control.options.map((option) => (
            <button
              key={option.value}
              type="button"
              className="chip"
              aria-pressed={option.value === value}
              onClick={() => {
                // Een voorinstelling zet naast zichzelf ook andere waarden.
                const extra = control.apply?.(option.value) ?? {};
                onChange(
                  { [control.key]: option.value, ...extra },
                  control.resets ?? Boolean(control.apply),
                );
              }}
            >
              {option.label[locale]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const checked = params[control.key] === true;

  return (
    <div className="control control-toggle">
      <label className="switch">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) =>
            onChange(
              { [control.key]: event.target.checked },
              control.resets ?? false,
            )
          }
        />
        <span className="switch-track" aria-hidden="true">
          <span className="switch-knob" />
        </span>
        <span className="control-label">{label}</span>
      </label>
    </div>
  );
}

function formatNumber(value: number, locale: Locale): string {
  const text = Number.isInteger(value)
    ? String(value)
    : value.toFixed(Math.abs(value) < 1 ? 3 : 2);
  return locale === "nl" ? text.replace(".", ",") : text;
}
