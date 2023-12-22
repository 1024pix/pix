import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';

class BlockSelect {
  constructor({ input, display, placeholder, ariaLabel, defaultValue, tolerances, options, solutions }) {
    assertNotNullOrUndefined(input, "L'input est obligatoire pour un bloc de selection");
    assertNotNullOrUndefined(display, 'Le display est obligatoire pour un bloc de selection');
    assertNotNullOrUndefined(placeholder, 'Le placeholder est obligatoire pour un bloc de selection');
    assertNotNullOrUndefined(ariaLabel, "L'aria Label est obligatoire pour un bloc de selection");
    assertNotNullOrUndefined(defaultValue, 'La valeur par défaut est obligatoire pour un bloc de selection');
    assertNotNullOrUndefined(tolerances, 'Les tolérances sont obligatoires pour un bloc de selection');
    assertNotNullOrUndefined(options, 'Les options sont obligatoires pour un bloc de selection');
    assertNotNullOrUndefined(solutions, 'Les solutions sont obligatoires pour un bloc de selection');

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
