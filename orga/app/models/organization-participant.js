import Model, { attr } from '@warp-drive/legacy/model';

export default class OrganizationParticipant extends Model {
  @attr('string') lastName;
  @attr('string') firstName;
  @attr('number') participationCount;
  @attr('date') lastParticipationDate;
  @attr('string') campaignName;
  @attr('string') campaignType;
  @attr('string') participationStatus;
  @attr('boolean', { allowNull: true }) isCertifiable;
  @attr('date') certifiableAt;
  @attr() extraColumns;
}
