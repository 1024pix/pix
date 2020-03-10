import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';

import isPasswordValid from '../utils/password-validator';

const ERROR_PASSWORD_MESSAGE =
  'Votre mot de passe doit contenir 8 caractères au minimum et comporter au moins une majuscule, une minuscule et un chiffre.';

export default class PasswordResetWindow extends Component {
  @service store;

  @service notifications;

  isLoading = false;
  isPasswordVisible = false;

  @computed('isPasswordVisible')
  get passwordInputType() {
    return this.isPasswordVisible ? 'text' : 'password';
  }

  student = null;
  isShowingModal = null;
  studentUser = null;

  init() {
    super.init(...arguments);
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
  }

  @action
  async updatePassword(event) {
    event.preventDefault();
    if (isPasswordValid(this.studentUser.password)) {
      this.set('isLoading', true);
      try {
        await this.studentUser.save();
        this.closePasswordReset();
        this.notifications.sendSuccess('Mot de passe modifié !');
      } catch (e) {
        this.closePasswordReset();
        this.notifications.sendError('Quelque chose s\'est mal passé. Veuillez réessayer.');
      } finally {
        this.set('isLoading', false);
      }
    }
  }

  @action
  togglePasswordVisibility() {
    this.toggleProperty('isPasswordVisible');
  }

  @action
  validateInputPassword() {
    const isInvalidInput = !isPasswordValid(this.studentUser.password);
    const message = isInvalidInput ? ERROR_PASSWORD_MESSAGE : '';
    this.set('validation.password.message', message);
  }

  @action
  closePasswordReset() {
    this.set('studentUser', null);
    this.set('validation', null);
    this.set('isShowingModal', false);
  }
}
