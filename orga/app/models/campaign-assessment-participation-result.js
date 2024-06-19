import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class CampaignAssessmentParticipationResult extends Model {
  @attr('number') campaignId;

  @belongsTo('campaign-assessment-participation', { async: true, inverse: 'campaignAssessmentParticipationResult' })
  campaignAssessmentParticipation;
  @hasMany('campaign-assessment-participation-competence-result', {
    async: true,
    inverse: 'campaignAssessmentParticipationResult',
  })
  competenceResults;

  get sortedCompetenceResults() {
    return this.hasMany('competenceResults').value().sortBy('index');
  }
}
