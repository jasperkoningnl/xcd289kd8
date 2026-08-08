import Link from "next/link";

export default function NietGevonden() {
  return (
    <div className="wrap wrap-narrow blok">
      <p className="eyebrow">404</p>
      <h1 className="blok-kop">Deze bladzijde bestaat niet</h1>
      <div className="prose">
        <p>
          Er is hier geen regel die dit adres oplevert. De zes stukken staan op
          de voorpagina.
        </p>
      </div>
      <p style={{ marginTop: "2rem" }}>
        <Link href="/" className="btn" style={{ textDecoration: "none" }}>
          Naar de voorpagina
        </Link>
      </p>
    </div>
  );
}
