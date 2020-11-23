class Tag {

  constructor({
    id,
    // attributes
    name,
  } = {}) {
    this.id = id;
    // attributes
    this.name = name;
  }
}
Tag.AGRICULTURE = 'AGRICULTURE';
Tag.POLE_EMPLOI = 'POLE EMPLOI';
Tag.CFA = 'CFA';
module.exports = Tag;
