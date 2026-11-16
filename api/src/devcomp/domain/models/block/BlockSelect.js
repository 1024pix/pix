class BlockSelect {
  constructor({ input, display, placeholder, ariaLabel, tolerances, options, solutions }) {
    this.type = 'select';
    this.input = input;
    this.display = display;
    this.placeholder = placeholder;
    this.ariaLabel = ariaLabel;
    this.tolerances = tolerances;
    this.options = options;
    this.solutions = solutions;
  }
}

export { BlockSelect };
