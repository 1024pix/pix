import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { computed } from '@ember/object';

export default class User extends Model {

  // attributes
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('string') email;
  @attr('string') username;
  @attr('string') password;
  @attr('boolean') cgu;
  @attr('boolean') hasSeenAssessmentInstructions;
  @attr('string') recaptchaToken;

  // includes
  @belongsTo('certification-profile') certificationProfile;
  @belongsTo('pix-score') pixScore;
  @hasMany('campaign-participation') campaignParticipations;
  @hasMany('certification') certifications;
  @hasMany('organization') organizations;
  @hasMany('scorecard') scorecards;

  // methods
  @computed('competences')
  get competenceAreas() {
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
  }

  @computed('firstName', 'lastName')
  get fullName() {
    return `${this.firstName} ${ this.lastName}`;
  }

  @computed('scorecards.@each.area')
  get areasCode() {
    return this.scorecards.mapBy('area.code').uniq();
  }
}
