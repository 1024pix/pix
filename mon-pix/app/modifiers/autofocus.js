import { modifier } from 'ember-modifier';

export default modifier((element, [shouldFocus = true]) => {
  if (shouldFocus) {
    element.focus({ focusVisible: false });
  }
});
