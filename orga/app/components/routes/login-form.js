import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import get from 'lodash/get';

export default class LoginForm extends Component {

  @service session;
  @service store;

  email = null;
  password = null;
  @tracked isLoading = false;
  @tracked isPasswordVisible = false;
  errorMessage = null;
  @tracked isErrorMessagePresent = false;

  get passwordInputType() {
    return this.isPasswordVisible ? 'text' : 'password';
  }

  @action
  async authenticate(event) {
    event.preventDefault();
    this.isLoading = true;
    const email = this.email ? this.email.trim() : '';
    const password = this.password;

    if (this.args.isWithInvitation) {
      try {
        await this._acceptOrganizationInvitation(this.args.organizationInvitationId, this.args.organizationInvitationCode, email);
      } catch (errorResponse) {
        errorResponse.errors.forEach((error) => {
          if (error.status === '412') {
            return this._authenticate(password, email);
          }
        });
      }
    }

    return this._authenticate(password, email);
  }

  @action
  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  _authenticate(password, email) {
    const scope = 'pix-orga';
    return this.session.authenticate('authenticator:oauth2', email, password, scope)
      .catch((response) => {
        this.isErrorMessagePresent = true;

        const nbErrors = get(response, 'errors.length', 0);
        if (nbErrors > 0) {
          this.errorMessage = response.errors[0].detail;
        } else {
          this.errorMessage = 'Le service est momentanément indisponible. Veuillez réessayer ultérieurement.';
        }
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  _acceptOrganizationInvitation(organizationInvitationId, organizationInvitationCode, email) {
    return this.store.createRecord('organization-invitation-response', {
      id: organizationInvitationId + '_' + organizationInvitationCode,
      code: organizationInvitationCode,
      email,
    }).save({ adapterOptions: { organizationInvitationId } });
  }
}
