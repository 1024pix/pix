import DS from 'ember-data';
const { Model, attr } = DS;

export default class CampaignReport extends Model {
  @attr('number') participationsCount;
  @attr('number') sharedParticipationsCount;
}
