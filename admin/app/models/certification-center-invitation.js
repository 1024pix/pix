import { service } from '@ember/service';
import Model, { attr, belongsTo } from '@ember-data/model';

export default class CertificationCenterInvitationModel extends Model {
  @service intl;

  @attr email;
  @attr updatedAt;
  @attr role;

  @belongsTo('certificationCenter', { async: true, inverse: null }) certificationCenter;

  get roleLabel() {
    switch (this.role) {
      case 'ADMIN':
        return this.intl.t('common.roles.admin');
      case 'MEMBER':
        return this.intl.t('common.roles.member');
      default:
        return '-';
    }
  }
}
