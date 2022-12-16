import Model, { attr, hasMany } from '@ember-data/model';

export default class CertificationProfileModel extends Model {
  @attr() userId;

  @hasMany('certified-skill') certifiedSkills;
  @hasMany('certified-tube') certifiedTubes;
  @hasMany('certified-competence') certifiedCompetences;
  @hasMany('certified-area') certifiedAreas;
}
