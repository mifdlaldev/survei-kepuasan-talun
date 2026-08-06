/**
 * Pola batik khas Jawa Barat sebagai tekstur latar halus.
 * SVG data-URI, dipakai sebagai background — bukan dekorasi berat.
 */
export function BatikPattern() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='56' height='56' viewBox='0 0 56 56' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%231E4D3B' stroke-width='1'%3E%3Cpath d='M28 8a20 20 0 1 1 0 40 20 20 0 1 1 0-40z'/%3E%3Cpath d='M28 16a12 12 0 1 1 0 24 12 12 0 1 1 0-24z'/%3E%3Cpath d='M28 24a4 4 0 1 1 0 8 4 4 0 1 1 0-8z'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: "56px 56px",
      }}
    />
  );
}
