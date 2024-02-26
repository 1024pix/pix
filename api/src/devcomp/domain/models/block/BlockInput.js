import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';

class BlockInput {
  constructor({ input, inputType, size, display, placeholder, ariaLabel, defaultValue, tolerances, solutions }) {
    assertNotNullOrUndefined(input, 'The input is required for an input block');
    assertNotNullOrUndefined(inputType, 'The input type is required for an input block');
    assertNotNullOrUndefined(size, 'The size is required for an input block');
    assertNotNullOrUndefined(display, 'The display is required for an input block');
    assertNotNullOrUndefined(placeholder, 'The placeholder is required for an input block');
    assertNotNullOrUndefined(ariaLabel, 'The aria Label is required for an input block');
    assertNotNullOrUndefined(defaultValue, 'The default value is required for an input block');
    assertNotNullOrUndefined(tolerances, 'The tolerances are required for an input block');
    assertNotNullOrUndefined(solutions, 'The solutions are required for an input block');

    this.type = 'input';
    this.input = input;
    this.inputType = inputType;
    this.size = size;
    this.display = display;
    this.placeholder = placeholder;
    this.ariaLabel = ariaLabel;
    this.defaultValue = defaultValue;
    this.tolerances = tolerances;
    this.solutions = solutions;
  }
}

export { BlockInput };
