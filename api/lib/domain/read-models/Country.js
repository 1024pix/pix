class Country {
  constructor({
    code,
    name,
    matcher,
  }) {
    this.code = code;
    this.name = name;
    this.matcher = matcher;
  }
}

module.exports = {
  Country,
};
