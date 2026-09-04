const normalizeText = (text) =>
  text
    .normalize('NFD')
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

export default function normalizeValue(value) {
  return normalizeText(value);
}

export function isSearchValid(item, search) {
  return normalizeText(item).includes(normalizeText(search));
}
