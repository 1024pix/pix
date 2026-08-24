import Model, { attr, hasMany } from '@warp-drive/legacy/model';

export default class SessionForSupervising extends Model {
  @attr('date-only') date;
  @attr('string') time;
  @attr('string') examiner;
  @attr('string') room;
  @attr('string') accessCode;
  @attr('string') address;
  @attr('boolean') hasExpired;
  @hasMany('certification-candidate-for-supervising', { async: false, inverse: null }) certificationCandidates;
}
