class Tube {
  constructor({
    id,
    name,
    title,
    description,
    practicalTitle,
    practicalDescription,
  } = {}) {
    this.id = id;
    this.name = name;
    this.title = title;
    this.description = description;
    this.practicalTitle = practicalTitle;
    this.practicalDescription = practicalDescription;
  }
}

module.exports = Tube;
