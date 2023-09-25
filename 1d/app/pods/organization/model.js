import Model, { attr } from '@ember-data/model';

export default class Organization extends Model {
  @attr('nullable-string') name;
}
