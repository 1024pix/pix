export function decodeExtraFilters(extraFilters) {
  return JSON.parse(decodeURI(extraFilters));
}

export function encodeExtraFilters(extraFilters) {
  return encodeURI(JSON.stringify(extraFilters));
}

export default { decodeExtraFilters, encodeExtraFilters };
