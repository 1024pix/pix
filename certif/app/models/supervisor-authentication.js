import Model, { attr } from '@ember-data/model';

export default class SupervisorAuthentication extends Model {
  @attr('string') sessionId;
  @attr('string') supervisorPassword;
}
