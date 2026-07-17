import Model, { attr } from '@ember-data/model';

export default class Module extends Model {
  @attr('string') shortId;
  @attr('string') title;
  @attr() details;
}
