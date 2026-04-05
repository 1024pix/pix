export class SmartRandomSkill {
  constructor({ id, name, difficulty }) {
    this.id = id;
    this.name = name;
    this.difficulty = difficulty;
  }

  get tubeName() {
    return this.name.slice(0, -1); //with skill'@sourceImage2', returns '@sourceImage'
  }

  get tubeNameWithoutPrefix() {
    return this.tubeName.slice(1); //with skill '@sourceImage2', returns 'sourceImage'
  }
}
