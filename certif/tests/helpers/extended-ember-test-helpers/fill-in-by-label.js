import { fillIn, findAll, find } from '@ember/test-helpers';

export default function fillInByLabel(labelText, value) {
  const control = _findControlForLabel(labelText);

  return fillIn(control, value);
}

function _findControlForLabel(labelText) {
  const label = _findLabel(labelText);
  if (label && label.control) return label.control;

  const control = _findControl(labelText);
  if (control) return control;

  if (label && !label.control) {
    throw new Error(`Found label "${labelText}" but no associated form control.`);
  }
  throw new Error(`Cannot find form control labelled "${labelText}".`);
}

function _findLabel(labelText) {
  return findAll('label').find((label) => label.innerText.includes(labelText));
}

function _findControl(labelText) {
  const selectors = [];

  for (const tag of ['input', 'textarea', 'select']) {
    for (const attr of ['aria-label', 'title']) {
      selectors.push(`${tag}[${attr}="${labelText}"]`);
    }
  }

  return find(selectors.join(','));
}
