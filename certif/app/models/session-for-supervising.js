/* eslint-disable ember/no-computed-properties-in-native-classes*/

import Model, { attr } from '@ember-data/model';

export default class SessionForSupervising extends Model {

  @attr('date-only') date;
  @attr('string') time;
  @attr('string') examiner;
  @attr('string') room;
  @attr('string') certificationCenterName;
  @attr() certificationCandidates;
}
