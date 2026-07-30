import Model, { attr, belongsTo } from '@warp-drive/legacy/model';

export default class OrganizationInvitation extends Model {
  @attr email;
  @attr status;
  @attr createdAt;
  @attr organizationName;
  @attr locale;
  @attr role;
  @attr('date') updatedAt;

  @belongsTo('organization', { async: true, inverse: null }) organization;

  get isPending() {
    return this.status === 'pending';
  }

  get isAccepted() {
    return this.status === 'accepted';
  }

  get roleInFrench() {
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
