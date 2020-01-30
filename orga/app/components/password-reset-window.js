import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

import isPasswordValid from '../utils/password-validator';

const ERROR_PASSWORD_MESSAGE =
  'Votre mot de passe doit contenir 8 caractères au minimum et comporter au moins une majuscule, une minuscule et un chiffre.';

export default Component.extend({

  store: service(),
  notifications: service('notifications'),

  isLoading: false,

  isPasswordVisible: false,
  passwordInputType: computed('isPasswordVisible', function() {
    return this.isPasswordVisible ? 'text' : 'password';
  }),
  student: null,
  isShowingModal: null,
  studentUser: null,

  init() {
    this._super(...arguments);
    this.studentUser = this.store.createRecord('student-dependent-user', {
      organizationId: this.student.organization.get('id'),
      studentId: this.student.id,
      password: null
    });
    this.set('validation', {
      password: {
        message: null
      }
    });
  },

  actions: {

    async updatePassword() {
      if (isPasswordValid(this.studentUser.password)) {
        this.set('isLoading', true);
        try {
          await this.studentUser.save();
          this.closePasswordReset();
          this.get('notifications').sendSuccess('Mot de passe modifié !');
        } catch (e) {
          this.closePasswordReset();
          this.get('notifications').sendError('Quelque chose s\'est mal passé. Veuillez réessayer.');
        } finally {
          this.set('isLoading', false);
        }
      }
    },

    togglePasswordVisibility() {
      this.toggleProperty('isPasswordVisible');
    },

    validateInputPassword() {
      const isInvalidInput = !isPasswordValid(this.studentUser.password);
      const message = isInvalidInput ? ERROR_PASSWORD_MESSAGE : '';
      this.set('validation.password.message', message);
    },
  },

  closePasswordReset() {
    this.set('studentUser', null);
    this.set('validation', null);
    this.set('isShowingModal', false);
  },

});
