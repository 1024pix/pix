import Model, { attr, belongsTo } from '@ember-data/model';

export default class SupOrganizationParticipant extends Model {
  @attr('string') lastName;
  @attr('string') firstName;
  @attr('date-only') birthdate;
  @attr('string') studentNumber;
  @attr('string') group;
  @attr('number') participationCount;
  @attr('date') lastParticipationDate;
  @attr('string') campaignName;
  @attr('string') campaignType;
  @attr('string') participationStatus;
  @attr('boolean', { allowNull: true }) isCertifiable;
  @attr('string') certifiableAt;

  @belongsTo('organization', { async: true, inverse: null }) organization;
}
