import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import isEmpty from 'lodash/isEmpty';
import isEmailValid from '../../utils/email-validator';
import isPasswordValid from '../../utils/password-validator';
import get from 'lodash/get';

const STATUSES = {
  DEFAULT: 'default',
  SUCCESS: 'success',
  ERROR: 'error',
};

class LastName {
  @tracked status = STATUSES.DEFAULT;
  @tracked message = null;
}

class FirstName {
  @tracked status = STATUSES.DEFAULT;
  @tracked message = null;
}

class Email {
  @tracked status = STATUSES.DEFAULT;
  @tracked message = null;
}

class Password {
  @tracked status = STATUSES.DEFAULT;
  @tracked message = null;
}

class SignupFormValidation {
  lastName = new LastName();
  firstName = new FirstName();
  email = new Email();
  password = new Password();
}

export default class RegisterForm extends Component {
  @service intl;
  @service url;
  @service store;
  @service session;

  @tracked isLoading = false;
  @tracked firstName = null;
  @tracked lastName = null;
  @tracked email = null;
  @tracked password = null;
  @tracked cguValidationMessage = null;
  @tracked errorMessage = null;
  @tracked validation = new SignupFormValidation();

  get cguUrl() {
    return this.url.cguUrl;
  }

  get dataProtectionPolicyUrl() {
    return this.url.dataProtectionPolicyUrl;
  }

  @action
  async register(event) {
    event.preventDefault();
    this.errorMessage = null;

    if (!this._isFormValid()) {
      return;
    }
    this.isLoading = true;

    let certificationCenterInvitationResponseRecord;
    const userRecord = this.store.createRecord('user', {
      lastName: this.lastName,
      firstName: this.firstName,
      email: this.email,
      password: this.password,
      cgu: true,
    });

    try {
      await userRecord.save();

      certificationCenterInvitationResponseRecord = this.store.createRecord(
        'certification-center-invitation-response',
        {
          id: this.args.certificationCenterInvitationId,
          code: this.args.certificationCenterInvitationCode,
          email: this.email,
        }
      );
      await certificationCenterInvitationResponseRecord.save({
        adapterOptions: { certificationCenterInvitationId: this.args.certificationCenterInvitationId },
      });

      await this._authenticate(this.email, this.password);
    } catch (response) {
      const status = get(response, 'errors[0].status');

      if (status === '422') {
        this.errorMessage = this.intl.t('pages.login-or-register.register-form.errors.email-already-exists');
      } else {
        this.errorMessage = this.intl.t('pages.login-or-register.register-form.errors.default');
      }

      await userRecord?.deleteRecord();
      await certificationCenterInvitationResponseRecord?.deleteRecord();
    } finally {
      this.isLoading = false;
    }
  }

  @action
  validatePassword(event) {
    this.validation.password.status = STATUSES.DEFAULT;
    this.validation.password.message = null;
    this.password = event.target.value;
    const isInvalidInput = !isPasswordValid(this.password);

    if (isInvalidInput) {
      this.validation.password.status = STATUSES.ERROR;
      this.validation.password.message = this.intl.t('pages.login-or-register.register-form.fields.password.error');
    } else {
      this.validation.password.status = STATUSES.SUCCESS;
    }
  }

  @action
  validateEmail(event) {
    this.validation.email.status = STATUSES.DEFAULT;
    this.validation.email.message = null;
    this.email = event.target.value?.trim().toLowerCase();
    const isInvalidInput = !isEmailValid(this.email);

    if (isInvalidInput) {
      this.validation.email.status = STATUSES.ERROR;
      this.validation.email.message = this.intl.t('pages.login-or-register.register-form.fields.email.error');
    } else {
      this.validation.email.status = STATUSES.SUCCESS;
    }
  }

  @action
  validateFirstName(event) {
    this.validation.firstName.status = STATUSES.DEFAULT;
    this.validation.firstName.message = null;
    this.firstName = event.target.value?.trim();
    const isInvalidInput = isEmpty(this.firstName);

    if (isInvalidInput) {
      this.validation.firstName.status = STATUSES.ERROR;
      this.validation.firstName.message = this.intl.t('pages.login-or-register.register-form.fields.first-name.error');
    } else {
      this.validation.firstName.status = STATUSES.SUCCESS;
    }
  }

  @action
  validateLastName(event) {
    this.validation.lastName.status = STATUSES.DEFAULT;
    this.validation.lastName.message = null;
    this.lastName = event.target.value?.trim();
    const isInvalidInput = isEmpty(this.lastName);

    if (isInvalidInput) {
      this.validation.lastName.status = STATUSES.ERROR;
      this.validation.lastName.message = this.intl.t('pages.login-or-register.register-form.fields.last-name.error');
    } else {
      this.validation.lastName.status = STATUSES.SUCCESS;
    }
  }

  @action
  validateCgu() {
    this.cguValidationMessage = null;
    const isInputChecked = Boolean(this.cgu);

    if (!isInputChecked) {
      this.cguValidationMessage = this.intl.t('pages.login-or-register.register-form.fields.cgu.error');
    }
  }

  _isFormValid() {
    return (
      !isEmpty(this.lastName) &&
      !isEmpty(this.firstName) &&
      isEmailValid(this.email) &&
      isPasswordValid(this.password) &&
      Boolean(this.cgu)
    );
  }

  _authenticate(email, password) {
    const scope = 'pix-certif';
    return this.session.authenticate('authenticator:oauth2', email, password, scope);
  }
}
