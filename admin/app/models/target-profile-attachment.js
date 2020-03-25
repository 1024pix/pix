import Model, { attr, belongsTo } from '@ember-data/model';

export default class TargetProfileAttachment extends Model {
  @attr targetProfilesToAttach;
  @belongsTo('organization') organization;
}
