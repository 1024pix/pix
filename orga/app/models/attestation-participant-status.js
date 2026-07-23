import Model, { attr } from '@warp-drive/legacy/model';

export default class AttestationParticipantStatus extends Model {
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('string') division;
  @attr('date') obtainedAt;
  @attr('string') attestationKey;
}
