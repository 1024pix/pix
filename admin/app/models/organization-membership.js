import Model, { attr, belongsTo } from '@ember-data/model';

const ROLE_LABELS = {
  ADMIN: 'Administrateur',
  MEMBER: 'Membre',
};

export default class OrganizationMembership extends Model {
  @attr() updatedAt;
  @attr() disabledAt;
  @attr() organizationRole;
  @attr() organizationId;
  @attr() organizationName;
  @attr() organizationType;
  @attr() organizationExternalId;

  @belongsTo('organization') organization;
  @belongsTo('user') user;

  get roleLabel() {
    return ROLE_LABELS[this.organizationRole];
  }
}
