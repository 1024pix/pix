import Model, { attr } from '@ember-data/model';
import { inject as service } from '@ember/service';

const CONNECTION_TYPES = {
  empty: 'pages.sco-organization-participants.connection-types.empty',
  none: 'pages.sco-organization-participants.connection-types.none',
  email: 'pages.sco-organization-participants.connection-types.email',
  identifiant: 'pages.sco-organization-participants.connection-types.identifiant',
  mediacentre: 'pages.sco-organization-participants.connection-types.mediacentre',
};
export default class OrganizationLearner extends Model {
  @service intl;

  @attr('string') lastName;
  @attr('string') firstName;
  @attr('string') username;
  @attr('string') division;
  @attr('string') group;
  @attr('string') email;
  @attr authenticationMethods;
  @attr('boolean') isCertifiable;
  @attr('date', { allowNull: true }) certifiableAt;

  get connectionMethods() {
    const messages = [];

    if (this.email) messages.push(this.intl.t(CONNECTION_TYPES['email']));
    if (this.username) messages.push(this.intl.t(CONNECTION_TYPES['identifiant']));
    if (this.authenticationMethods.includes('GAR')) messages.push(this.intl.t(CONNECTION_TYPES['mediacentre']));
    if (messages.length === 0) messages.push(this.intl.t(CONNECTION_TYPES['empty']));

    return messages.join(', ');
  }
}
