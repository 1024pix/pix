import Model, { attr } from '@ember-data/model';

export default class Badge extends Model {
  @attr('string') title;
  @attr('string') imageUrl;
  @attr('string') altMessage;
}
