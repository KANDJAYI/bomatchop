import type { CartLine } from "@/lib/types";

export type CartVendorGroup = {
  vendorId: string;
  vendorName: string;
  lines: CartLine[];
  subtotal: number;
};

export function groupCartLinesByVendor(lines: CartLine[]): CartVendorGroup[] {
  const map = new Map<string, CartLine[]>();
  const names = new Map<string, string>();
  for (const line of lines) {
    const id = line.product.vendorId;
    names.set(id, line.product.vendorName);
    const arr = map.get(id) ?? [];
    arr.push(line);
    map.set(id, arr);
  }
  return [...map.entries()].map(([vendorId, groupLines]) => ({
    vendorId,
    vendorName: names.get(vendorId) ?? "",
    lines: groupLines,
    subtotal: groupLines.reduce(
      (s, l) => s + l.product.pricePromo * l.quantity,
      0,
    ),
  }));
}
