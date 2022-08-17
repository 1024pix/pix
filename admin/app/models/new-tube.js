import Model, { attr } from '@ember-data/model';

export default class NewTube extends Model {
  @attr() name;
  @attr() practicalTitle;
  @attr() level;
  @attr() mobile;
  @attr() tablet;

  get title() {
    return `${this.name} : ${this.practicalTitle}`;
  }
}
