import Model, { attr } from '@ember-data/model';

export default class Badge extends Model {
  @attr() key;
  @attr() title;
  @attr() message;
  @attr() imageUrl;
  @attr() altMessage;
}
