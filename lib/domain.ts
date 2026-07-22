export function normalizeDomain(input: string): string {
  let d = input.trim();
  if (!/^https?:\/\//i.test(d)) d = `https://${d}`;
  return d.replace(/\/$/, "");
}

// Canonical key used to match a domain to a project regardless of protocol/www.
export function projectKey(input: string): string {
  return normalizeDomain(input)
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .toLowerCase();
}
