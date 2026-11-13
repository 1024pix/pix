class Section {
  static AVAILABLE_TYPES = Object.freeze([
    'question-yourself',
    'explore-to-understand',
    'retain-the-essentials',
    'practise',
    'go-further',
    'blank',
  ]);

  constructor({ id, type, grains }) {
    this.id = id;
    this.type = type;
    this.grains = grains;
  }
}

export { Section };
