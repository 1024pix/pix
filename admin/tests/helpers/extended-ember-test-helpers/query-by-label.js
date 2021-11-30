import { findAll } from '@ember/test-helpers';

export default function queryByLabel(labelText, options = {}) {
  options.exact = options.exact ?? false;

  const labelElement = _findLabelElement(labelText, options);
  if (labelElement) {
    return _getElementControlledByLabel(labelElement, labelText);
  }

  const labelledElement = _findElementWithLabel(labelText);

  if (!labelledElement) {
    return null;
  }

  return labelledElement;
}

function _findLabelElement(labelText, options) {
  return findAll('label').find((label) => {
    if (options.exact) {
      return label.innerText === labelText;
    }

    return label.innerText.includes(labelText);
  });
}

function _getElementControlledByLabel(label, labelText) {
  if (!label.control) {
    throw new Error(`Found label "${labelText}" but no associated form control.`);
  }

  return label.control;
}

function _findElementWithLabel(labelText) {
  const labellableElementSelectors = [
    'button',
    'a[href]',
    '[role="button"]',
    'input',
    'textarea',
    'select',
    'label[for]',
    'img',
    'svg',
  ];
  return findAll(labellableElementSelectors.join(',')).find(_matchesLabel(labelText));
}

function _matchesLabel(labelText) {
  return (element) =>
    _matchesInnerText(element, labelText) ||
    _matchesTitle(element, labelText) ||
    _matchesAriaLabel(element, labelText) ||
    _matchesAltAttribute(element, labelText);
}

function _matchesInnerText(element, labelText) {
  return element.innerText?.includes(labelText);
}

function _matchesTitle(element, labelText) {
  return element.title?.includes(labelText);
}

function _matchesAltAttribute(element, labelText) {
  return element.alt?.includes(labelText);
}

function _matchesAriaLabel(element, labelText) {
  const ariaLabel = element.getAttribute('aria-label');
  return ariaLabel?.includes(labelText);
}
