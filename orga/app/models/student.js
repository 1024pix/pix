import { notEmpty } from '@ember/object/computed';
import { computed } from '@ember/object';
import Model, { belongsTo, attr } from '@ember-data/model';

const dash = '\u2013';

const StudentAuthMethod = {
  studentNotReconcilied: {
    message: dash,
  },
  hasEmail: {
    message: 'Adresse e-mail'
  },
  isAuthenticatedFromGar: {
    message: 'Mediacentre'
  },
  hasUsername: {
    message: 'Identifiant'
  },
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
    const SPACING_CHARACTER = '\n';
    let message = '';
    const props = ['hasEmail', 'hasUsername', 'isAuthenticatedFromGar'];

    props.forEach((prop) => {
      if (this[prop]) {
        message = message.concat(StudentAuthMethod[prop].message, SPACING_CHARACTER);
      }
    });

    return message ?  message.trim() : StudentAuthMethod['studentNotReconcilied'].message;

  }

  @computed('hasUsername', 'hasEmail', 'isAuthenticatedFromGar')
  get isStudentAssociated() {
    return Boolean(this.email || this.username || this.isAuthenticatedFromGar);
  }
}
