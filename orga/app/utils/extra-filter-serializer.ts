export function decodeExtraFilters(extraFilters: string): unknown {
  return JSON.parse(decodeURI(extraFilters));
}

export function encodeExtraFilters(extraFilters: unknown): string {
  return encodeURI(JSON.stringify(extraFilters));
}

export default { decodeExtraFilters, encodeExtraFilters };
