import Model, { attr } from '@warp-drive/legacy/model';

export default class OrganizationStatistic extends Model {
  @attr('number') totalParticipantsCount;
  @attr('array') totalParticipantsCountByYear;
}
