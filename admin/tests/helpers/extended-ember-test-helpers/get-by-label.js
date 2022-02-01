import queryByLabel from './query-by-label';

export default function getByLabel(labelText, options) {
  const labelledElement = queryByLabel(labelText, options);
  if (!labelledElement) {
    throw new Error(`Cannot find any element labelled "${labelText}".`);
  }

  return labelledElement;
}
