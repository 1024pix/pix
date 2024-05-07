import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class CampaignAssessmentParticipationResult extends Model {
  @attr('number') campaignId;

  @belongsTo('campaignAssessmentParticipation', { async: true, inverse: 'campaignAssessmentParticipationResult' })
  campaignAssessmentParticipation;
  @hasMany('campaignAssessmentParticipationCompetenceResult', {
    async: true,
    inverse: 'campaignAssessmentParticipationResult',
  })
  competenceResults;

  get sortedCompetenceResults() {
    return this.hasMany('competenceResults').value().sortBy('index');
  }
}
