import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BambooProgress } from "@/components/BambooProgress";

describe("BambooProgress", () => {
  it("menampilkan label dan hitungan langkah", () => {
    render(<BambooProgress current={0} total={4} label="Langkah" />);
    expect(screen.getByText("Langkah")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("/ 4")).toBeInTheDocument();
  });

  it("mengisi segmen sesuai current", () => {
    const { container } = render(<BambooProgress current={2} total={4} label="Pertanyaan" />);
    const segments = container.querySelectorAll('[role="progressbar"] > div');
    expect(segments).toHaveLength(4);

    const filled = Array.from(segments).filter((s) => s.className.includes("bg-gradient-to-r"));
    expect(filled).toHaveLength(3);
  });

  it("aria-valuenow mencerminkan posisi", () => {
    render(<BambooProgress current={1} total={4} label="Langkah" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "2");
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "4");
  });
});
