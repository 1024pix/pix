import Model, { belongsTo, hasMany, attr } from '@ember-data/model';
import { computed } from '@ember/object';

export default Model.extend({
  firstName: attr('string'),
  lastName: attr('string'),
  email: attr('string'),
  username: attr('string'),
  password: attr('string'),
  cgu: attr('boolean'),
  hasSeenAssessmentInstructions: attr('boolean'),
  recaptchaToken: attr('string'),
  totalPixScore: attr('number'),
  pixScore: belongsTo('pix-score'),
  competences: hasMany('competence'),
  organizations: hasMany('organization'),
  certifications: hasMany('certification'),
  campaignParticipations: hasMany('campaign-participation'),
  scorecards: hasMany('scorecard'),
  certificationProfile: belongsTo('certification-profile'),

  competenceAreas: computed('competences', function() {
    return this.competences.then((competences) => {
      return competences.reduce((areas, competence) => {
        competence.get('area').then((competenceArea) => {
          if (!areas[competenceArea.get('id')]) {
            areas[competenceArea.get('id')] = {
              name: competenceArea.get('name'),
              competences: []
            };
          }
          areas[competenceArea.get('id')].competences.push(competence);
          return areas;
        });
      }, []);
    });
  }),

  fullName: computed('firstName', 'lastName', function() {
    return `${this.firstName} ${ this.lastName}`;
  }),

  areasCode: computed('scorecards.@each.area', function() {
    return this.scorecards.mapBy('area.code').uniq();
  }),
});
