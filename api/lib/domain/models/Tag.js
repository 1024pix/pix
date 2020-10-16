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
module.exports = Tag;
