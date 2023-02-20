class Area {
  constructor({ id, code, name, title, color, competences = [], frameworkId }) {
    this.id = id;
    this.code = code;
    this.name = name;
    this.title = title;
    this.color = color;
    this.competences = competences;
    this.frameworkId = frameworkId;
  }
}

export default Area;
