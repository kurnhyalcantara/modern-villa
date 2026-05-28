export function formatRupiah(value: unknown): string {
  let num: number;
  if (typeof value === 'number') {
    num = value;
  } else if (typeof value === 'string') {
    num = Number(value);
  } else if (typeof value === 'bigint') {
    num = Number(value);
  } else if (
    value !== null &&
    typeof value === 'object' &&
    'toNumber' in value &&
    typeof (value as { toNumber: () => number }).toNumber === 'function'
  ) {
    num = (value as { toNumber: () => number }).toNumber();
  } else {
    num = Number(value);
  }
  if (Number.isNaN(num)) return 'Rp0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}
