import Model, { belongsTo, attr } from '@ember-data/model';

const DASH = '\u2013';
const SPACING_CHARACTER = '\n';

export const CONNEXION_TYPES = {
  none: 'Aucune',
  email: 'Adresse e-mail',
  identifiant: 'Identifiant',
  mediacentre: 'Mediacentre',
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

    if (!this.isStudentAssociated) messages.push(DASH);
    if (this.hasEmail) messages.push(CONNEXION_TYPES['email']);
    if (this.hasUsername) messages.push(CONNEXION_TYPES['identifiant']);
    if (this.isAuthenticatedFromGar) messages.push(CONNEXION_TYPES['mediacentre']);

    return messages.length > 0 ? messages.join(SPACING_CHARACTER) : '';
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
