import Model, { attr, belongsTo } from '@ember-data/model';

export default class CertificationCenterInvitationModel extends Model {
  @attr email;
  @attr updatedAt;

  @belongsTo('certificationCenter') certificationCenter;
}
