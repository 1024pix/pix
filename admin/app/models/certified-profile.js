import Model, { attr, hasMany } from '@ember-data/model';

export default class CertificationProfileModel extends Model {
  @attr() userId;

  @hasMany('certified-skill', { async: true, inverse: null }) certifiedSkills;
  @hasMany('certified-tube', { async: true, inverse: null }) certifiedTubes;
  @hasMany('certified-competence', { async: true, inverse: null }) certifiedCompetences;
  @hasMany('certified-area', { async: true, inverse: null }) certifiedAreas;
}
