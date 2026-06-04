import Model, { attr } from '@ember-data/model';

export default class OrganizationStatistic extends Model {
  @attr('number') totalParticipantsCount;
  @attr('array') totalParticipantsCountByYear;
}
