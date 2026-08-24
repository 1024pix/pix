import Model, { attr } from '@warp-drive/legacy/model';

export default class ScoBlockedAccessDate extends Model {
  @attr('date') reopeningDate;
}
