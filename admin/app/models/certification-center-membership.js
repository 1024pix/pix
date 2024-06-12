import Model, { attr, belongsTo } from '@ember-data/model';

const ROLE_LABEL_KEYS = {
  ADMIN: 'components.memberships-section.roles.admin',
  MEMBER: 'components.memberships-section.roles.member',
};

export default class CertificationCenterMembership extends Model {
  @attr('date') createdAt;
  @attr() role;
  @belongsTo('certification-center', { async: true, inverse: null }) certificationCenter;
  @belongsTo('user', { async: true, inverse: 'certificationCenterMemberships' }) user;

  get roleLabelKey() {
    return ROLE_LABEL_KEYS[this.role];
  }
}
