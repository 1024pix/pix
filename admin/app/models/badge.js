import Model, { attr, belongsTo } from '@ember-data/model';

export default class Badge extends Model {
  @belongsTo('target-profile') targetProfile;

  @attr() key;
  @attr() title;
  @attr() message;
  @attr() imageUrl;
  @attr() altMessage;
  @attr() isCertifiable;
}
