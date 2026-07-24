import Model, { attr } from '@warp-drive/legacy/model';

export default class CertificationCenterMembership extends Model {
  @attr('number') userId;
  @attr('number') certificationCenterId;
  @attr('string') role;

  get isAdmin() {
    return this.role === 'ADMIN';
  }
}
