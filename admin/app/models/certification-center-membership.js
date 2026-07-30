import Model, { attr, belongsTo } from '@warp-drive/legacy/model';

const ROLE_LABEL_KEYS = {
  ADMIN: 'components.memberships-section.roles.admin',
  MEMBER: 'components.memberships-section.roles.member',
};

export default class CertificationCenterMembership extends Model {
  @attr('date') createdAt;
  @attr() role;
  @attr('date') lastAccessedAt;
  @belongsTo('certification-center', { async: true, inverse: 'certificationCenterMemberships' }) certificationCenter;
  @belongsTo('user', { async: true, inverse: 'certificationCenterMemberships' }) user;

  get roleLabelKey() {
    return ROLE_LABEL_KEYS[this.role];
  }
}
