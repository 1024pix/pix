import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr } from '@warp-drive/legacy/model';
import type { StringTransform } from '@warp-drive/legacy/serializer/transform';

export default class MemberIdentityModel extends Model {
  declare [Type]: 'member-identity';

  @attr<StringTransform>('string') declare firstName: string | null;
  @attr<StringTransform>('string') declare lastName: string | null;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
