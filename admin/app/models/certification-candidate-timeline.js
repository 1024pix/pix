import Model, { attr } from '@warp-drive/legacy/model';

export default class CertificationCandidateTimeline extends Model {
  @attr() events;
}
