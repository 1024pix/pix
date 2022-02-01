import Model, { attr } from '@ember-data/model';

export default class Group extends Model {
  @attr('string') name;
}
