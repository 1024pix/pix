import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';

class BlockSelect {
  constructor({ input, display, placeholder, ariaLabel, defaultValue, tolerances, options, solutions }) {
    assertNotNullOrUndefined(input, 'The input is required for a select block');
    assertNotNullOrUndefined(display, 'The display is required for a select block');
    assertNotNullOrUndefined(placeholder, 'The placeholder is required for a select block');
    assertNotNullOrUndefined(ariaLabel, 'The aria Label is required for a select block');
    assertNotNullOrUndefined(defaultValue, 'The default value is required for a select block');
    assertNotNullOrUndefined(tolerances, 'The tolerances are required for a select block');
    assertNotNullOrUndefined(options, 'The options are required for a select block');
    assertNotNullOrUndefined(solutions, 'The solutions are required for a select block');

    this.type = 'select';
    this.input = input;
    this.display = display;
    this.placeholder = placeholder;
    this.ariaLabel = ariaLabel;
    this.defaultValue = defaultValue;
    this.tolerances = tolerances;
    this.options = options;
    this.solutions = solutions;
  }
}

export { BlockSelect };
