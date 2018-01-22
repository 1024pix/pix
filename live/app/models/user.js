import { computed } from '@ember/object';
import DS from 'ember-data';

const { Model, attr, hasMany } = DS;

export default Model.extend({
  firstName: attr('string'),
  lastName: attr('string'),
  email: attr('string'),
  password: attr('string'),
  cgu: attr('boolean'),
  recaptchaToken: attr('string'),
  competences: hasMany('competence'),
  totalPixScore: attr('number'),
  organizations: hasMany('organization'),

  competenceAreas: computed('competences', function() {
    return this.get('competences').then(competences => {
      return competences.reduce((areas, competence) => {
        competence.get('area').then(competenceArea => {
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
    return `${this.get('firstName')} ${ this.get('lastName')}`;
  })
});
