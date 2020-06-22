import { notEmpty } from '@ember/object/computed';
import { computed } from '@ember/object';
import Model, { belongsTo, attr } from '@ember-data/model';

const DASH = '\u2013';
const SPACING_CHARACTER = '\n';

export const CONNEXION_TYPES = {
  none: 'Non connecté',
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
  @attr('boolean') isAuthenticatedFromGar;
  @belongsTo('organization') organization;
  @notEmpty('username') hasUsername;
  @notEmpty('email') hasEmail;

  @computed('hasUsername', 'hasEmail', 'isAuthenticatedFromGar')
  
  get authenticationMethods() {
    const messages = [];

    if (!this.isStudentAssociated) messages.push(DASH);
    if (this.hasEmail) messages.push(CONNEXION_TYPES['email']);
    if (this.hasUsername) messages.push(CONNEXION_TYPES['identifiant']);
    if (this.isAuthenticatedFromGar) messages.push(CONNEXION_TYPES['mediacentre']);

    return messages.length > 0 ? messages.join(SPACING_CHARACTER) : '';
  }

  @computed('hasUsername', 'hasEmail', 'isAuthenticatedFromGar')
  get isStudentAssociated() {
    return Boolean(this.email || this.username || this.isAuthenticatedFromGar);
  }
}
