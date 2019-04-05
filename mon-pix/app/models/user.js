import { computed } from '@ember/object';
import DS from 'ember-data';

const { Model, attr, hasMany, belongsTo } = DS;

export default Model.extend({
  firstName: attr('string'),
  lastName: attr('string'),
  email: attr('string'),
  password: attr('string'),
  cgu: attr('boolean'),
  recaptchaToken: attr('string'),
  totalPixScore: attr('number'),
  pixScore: belongsTo('pix-score'),
  competences: hasMany('competence'),
  organizations: hasMany('organization'),
  certifications: hasMany('certification'),
  campaignParticipations: hasMany('campaign-participation'),
  scorecards: hasMany('scorecard'),

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

  allAreas: computed.mapBy('scorecards', 'area.code'),
  areas: computed.uniq('allAreas'),
});
