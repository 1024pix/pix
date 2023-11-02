import Model, { attr, belongsTo } from '@ember-data/model';

export default class CertificationCenterInvitationModel extends Model {
  @attr email;
  @attr updatedAt;
  @attr role;

  @belongsTo('certificationCenter') certificationCenter;

  get roleLabel() {
    switch (this.role) {
      case 'ADMIN':
        return 'Administrateur';
      case 'MEMBER':
        return 'Membre';
      default:
        return '-';
    }
  }
}
