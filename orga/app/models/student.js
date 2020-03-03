import DS from 'ember-data';
import { notEmpty } from '@ember/object/computed';
import { computed } from '@ember/object';

const StudentAuthMethod = {
  studentNotReconcilied: {
    message: '-',
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

export default DS.Model.extend({
  lastName: DS.attr('string'),
  firstName: DS.attr('string'),
  birthdate: DS.attr('date-only'),
  organization: DS.belongsTo('organization'),
  username: DS.attr('string'),
  email: DS.attr('string'),
  isAuthenticatedFromGar: DS.attr('boolean'),
  hasUsername: notEmpty('username'),
  hasEmail: notEmpty('email'),
  authenticationMethods : computed('hasUsername', 'hasEmail', 'isAuthenticatedFromGar', function() {

    const SPACING_CHARACTER = ' ';
    let message = '';
    const props = ['hasEmail', 'hasUsername', 'isAuthenticatedFromGar'];

    props.forEach((prop) => {
      if (this[prop]) {
        message = message.concat(StudentAuthMethod[prop].message, SPACING_CHARACTER);
      }
    });

    return message ?  message.trim() : StudentAuthMethod['studentNotReconcilied'].message;

  }),
});
