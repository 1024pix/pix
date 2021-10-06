import { fillIn, find } from '@ember/test-helpers';
import queryByLabel from './query-by-label';

export default function fillInSelect({ labelText, id, value }) {
  let select;
  if (labelText) {
    select = queryByLabel(labelText);
  } else if (id) {
    select = find(id);
  } else {
    select = find('.pix-select > select');
  }

  if (!select) {
    throw new Error('No select element found.');
  }

  let optionValueToSelect;
  for (let i = 0; i < select.options.length; i++) {
    const option = select.options[i];
    if (option.label === value) {
      optionValueToSelect = option.value;
    }
  }

  if (!optionValueToSelect) {
    throw new Error(`No option found with label ${value}.`);
  }

  return fillIn(select, optionValueToSelect);
}
