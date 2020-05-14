import Model, { attr } from '@ember-data/model';

export default class Badge extends Model {

  // attributes
  @attr('string') altMessage;
  @attr('string') message;
  @attr('string') imageUrl;
  @attr('string') key;
}
