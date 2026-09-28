import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr } from '@warp-drive/legacy/model';
import type { DateTransform, StringTransform } from '@warp-drive/legacy/serializer/transform';

export default class AttestationParticipantStatus extends Model {
  declare [Type]: 'attestation-participant-status';

  @attr<StringTransform>('string') declare firstName: string | null;
  @attr<StringTransform>('string') declare lastName: string | null;
  @attr<StringTransform>('string') declare division: string | null;
  @attr<DateTransform>('date') declare obtainedAt: Date | null;
  @attr<StringTransform>('string') declare attestationKey: string | null;
}
