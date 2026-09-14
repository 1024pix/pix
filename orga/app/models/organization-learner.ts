import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr } from '@warp-drive/legacy/model';
import type { BooleanTransform, DateTransform, StringTransform } from '@warp-drive/legacy/serializer/transform';

export default class OrganizationLearner extends Model {
  declare [Type]: 'organization-learner';

  @attr<StringTransform>('string') declare lastName: string | null;
  @attr<StringTransform>('string') declare firstName: string | null;
  @attr<StringTransform>('string') declare username: string | null;
  @attr<StringTransform>('string') declare division: string | null;
  @attr<StringTransform>('string') declare group: string | null;
  @attr<StringTransform>('string') declare email: string | null;
  @attr() declare authenticationMethods: string[] | null;
  @attr<BooleanTransform>('boolean') declare isCertifiable: boolean | null;
  @attr<DateTransform>('date') declare certifiableAt: Date | null;

  get authenticationMethodsList(): string[] {
    const connectionMethodsList = [];

    if (this.email) connectionMethodsList.push('email');
    if (this.username) connectionMethodsList.push('identifiant');
    if (this.authenticationMethods?.includes('GAR')) connectionMethodsList.push('mediacentre');
    if (connectionMethodsList.length === 0) connectionMethodsList.push('empty');
    return connectionMethodsList;
  }
}
