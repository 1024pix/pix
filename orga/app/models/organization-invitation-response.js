import DS from 'ember-data';
const { Model, attr } = DS;

export default class CampaignAssessmentParticipationSummary extends Model {
  @attr('string') code;
  @attr('string') email;
}
