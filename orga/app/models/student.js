import Model, { belongsTo, attr } from '@ember-data/model';

export const CONNECTION_TYPES = {
  empty: 'pages.students-sco.connection-types.empty',
  none: 'pages.students-sco.connection-types.none',
  email: 'pages.students-sco.connection-types.email',
  identifiant: 'pages.students-sco.connection-types.identifiant',
  mediacentre: 'pages.students-sco.connection-types.mediacentre',
};

export default class Student extends Model {
  @attr('string')lastName;
  @attr('string') firstName;
  @attr('date-only') birthdate;
  @attr('string') username;
  @attr('string') email;
  @attr('string') studentNumber;
  @attr('boolean') isAuthenticatedFromGar;
  @belongsTo('organization') organization;

  get hasUsername() {
    return Boolean(this.username);
  }

  get hasEmail() {
    return Boolean(this.email);
  }

  get authenticationMethods() {
    const messages = [];

    if (!this.isStudentAssociated) messages.push(CONNECTION_TYPES['empty']);
    if (this.hasEmail) messages.push(CONNECTION_TYPES['email']);
    if (this.hasUsername) messages.push(CONNECTION_TYPES['identifiant']);
    if (this.isAuthenticatedFromGar) messages.push(CONNECTION_TYPES['mediacentre']);

    return messages;
  }

  get isStudentAssociated() {
    return Boolean(this.hasEmail || this.hasUsername || this.isAuthenticatedFromGar);
  }

  get isAuthenticatedWithGarOnly() {
    return Boolean(!this.hasUsername && !this.hasEmail && this.isAuthenticatedFromGar);
  }

  get displayAddUsernameAuthentication() {
    return Boolean(!this.hasUsername && (this.isAuthenticatedFromGar || this.hasEmail));
  }

}
