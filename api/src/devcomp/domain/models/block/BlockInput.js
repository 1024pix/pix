import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';

class BlockInput {
  constructor({ type, input, inputType, size, display, placeholder, ariaLabel, defaultValue, tolerances, solutions }) {
    assertNotNullOrUndefined(type, "Le type est obligatoire pour un bloc d'input");
    assertNotNullOrUndefined(input, "L'input est obligatoire pour un bloc d'input");
    assertNotNullOrUndefined(inputType, "Le type d'input est obligatoire pour un bloc d'input");
    assertNotNullOrUndefined(size, "La taille est obligatoire pour un bloc d'input");
    assertNotNullOrUndefined(display, "Le display est obligatoire pour un bloc d'input");
    assertNotNullOrUndefined(placeholder, "Le placeholder est obligatoire pour un bloc d'input");
    assertNotNullOrUndefined(ariaLabel, "L'aria Label est obligatoire pour un bloc d'input");
    assertNotNullOrUndefined(defaultValue, "La valeur par défaut est obligatoire pour un bloc d'input");
    assertNotNullOrUndefined(tolerances, "Les tolérances sont obligatoires pour un bloc d'input");
    assertNotNullOrUndefined(solutions, "Les solutions sont obligatoires pour un bloc d'input");

    this.type = type;
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
