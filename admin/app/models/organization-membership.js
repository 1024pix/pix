import Model, { attr } from '@ember-data/model';

const ROLE_LABELS = {
  ADMIN: 'Administrateur',
  MEMBER: 'Membre',
};

export default class OrganizationMembership extends Model {
  @attr() updatedAt;
  @attr() role;
  @attr() disabledAt;
  @attr() organizationId;
  @attr() organizationName;
  @attr() organizationType;
  @attr() organizationExternalId;

  get roleLabel() {
    return ROLE_LABELS[this.role];
  }
}
