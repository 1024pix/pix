class BlockInput {
  constructor({ input, inputType, size, display, placeholder, ariaLabel, tolerances, solutions }) {
    this.type = 'input';
    this.input = input;
    this.inputType = inputType;
    this.size = size;
    this.display = display;
    this.placeholder = placeholder;
    this.ariaLabel = ariaLabel;
    this.tolerances = tolerances;
    this.solutions = solutions;
  }
}

export { BlockInput };
