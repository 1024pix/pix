import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import _ from 'lodash';

export default class LoginForm extends Component {

  @service session;
  @service store;

  email = null;
  password = null;
  isLoading = false;
  isPasswordVisible = false;
  errorMessage = null;

  @computed('isPasswordVisible')
  get passwordInputType() {
    return this.isPasswordVisible ? 'text' : 'password';
  }

  isErrorMessagePresent = false;

  @action
  async authenticate(event) {
    event.preventDefault();
    this.set('isLoading', true);
    const email = this.email ? this.email.trim() : '';
    const password = this.password;

    if (this.isWithInvitation) {
      try {
        await this._acceptOrganizationInvitation(this.organizationInvitationId, this.organizationInvitationCode, email);
      } catch (errorResponse) {
        errorResponse.errors.forEach((error) => {
          if (error.status === '421') {
            return this._authenticate(password, email);
          }
        });
      }
    }

    return this._authenticate(password, email);
  }

  @action
  togglePasswordVisibility() {
    this.toggleProperty('isPasswordVisible');
  }

  _authenticate(password, email) {
    const scope = 'pix-orga';
    return this.session.authenticate('authenticator:oauth2', email, password, scope)
      .catch((response) => {
        this.set('isErrorMessagePresent', true);

        const nbErrors = _.get(response, 'errors.length', 0);
        if (nbErrors > 0) {
          this.set('errorMessage', response.errors[0].detail);
        } else {
          this.set('errorMessage','Le service est momentanément indisponible. Veuillez réessayer ultérieurement.');
        }
      })
      .finally(() => {
        this.set('isLoading', false);
      });
  }

  _acceptOrganizationInvitation(organizationInvitationId, organizationInvitationCode, email) {
    const status = 'accepted';
    return this.store.createRecord('organization-invitation-response', {
      id: organizationInvitationId + '_' + organizationInvitationCode,
      code: organizationInvitationCode,
      status,
      email,
    }).save({ adapterOptions: { organizationInvitationId } });
  }
}
