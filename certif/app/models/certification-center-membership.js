import Model, { attr } from '@ember-data/model';

export default class CertificationCenterMembership extends Model {
  @attr('number') userId;
  @attr('number') certificationCenterId;
  @attr('string') role;

  get isAdmin() {
    return this.role === 'ADMIN';
  }
}
