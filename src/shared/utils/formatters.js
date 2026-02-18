
export const formatLargeNumber = (num, locale = 'es-HN') => {
  const value = Number(num || 0);
  if (Number.isNaN(value)) return '0';
  if (value >= 1000000000) {
    const formatted = (value / 1000000000).toFixed(1);
    return formatted.replace('.0', '') + 'B';
  } else if (value >= 1000000) {
    const formatted = (value / 1000000).toFixed(1);
    return formatted.replace('.0', '') + 'M';
  } else if (value >= 1000) {
    const formatted = (value / 1000).toFixed(1);
    return formatted.replace('.0', '') + 'K';
  }
  return value.toLocaleString(locale);
};

export const formatCurrency = (v) => {
  if (v === null || v === undefined || v === "") return "—";
  const num = Number(v);
  if (isNaN(num)) return v;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(num).replace('$', '') + " HNL";
};

export const formatDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};