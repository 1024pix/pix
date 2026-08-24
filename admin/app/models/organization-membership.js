import Model, { attr, belongsTo } from '@warp-drive/legacy/model';

const ROLE_LABELS = {
  ADMIN: 'Administrateur',
  MEMBER: 'Membre',
};

export default class OrganizationMembership extends Model {
  @attr() disabledAt;
  @attr() organizationRole;
  @attr() organizationId;
  @attr() organizationName;
  @attr() organizationType;
  @attr() organizationExternalId;
  @attr() lastAccessedAt;

  @belongsTo('organization', { async: true, inverse: 'organizationMemberships' }) organization;
  @belongsTo('user', { async: true, inverse: 'organizationMemberships' }) user;

  get roleLabel() {
    return ROLE_LABELS[this.organizationRole];
  }
}
