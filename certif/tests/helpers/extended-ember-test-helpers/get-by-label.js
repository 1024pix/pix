import queryByLabel from './query-by-label';

export default function getByLabel(labelText) {
  const labelledElement = queryByLabel(labelText);
  if (!labelledElement) {
    throw new Error(`Cannot find any element labelled "${labelText}".`);
  }

  return labelledElement;
}
