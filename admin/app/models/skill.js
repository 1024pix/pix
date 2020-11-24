import Model, { attr } from '@ember-data/model';

export default class Skill extends Model {
  @attr('string') name;
}
