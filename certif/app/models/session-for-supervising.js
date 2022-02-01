import Model, { attr, hasMany } from '@ember-data/model';

export default class SessionForSupervising extends Model {
  @attr('date-only') date;
  @attr('string') time;
  @attr('string') examiner;
  @attr('string') room;
  @attr('string') certificationCenterName;
  @hasMany('certification-candidate-for-supervising') certificationCandidates;
}
