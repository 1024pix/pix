import Model, { attr } from '@warp-drive/legacy/model';

export default class MemberIdentityModel extends Model {
  @attr('string') firstName;
  @attr('string') lastName;

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
