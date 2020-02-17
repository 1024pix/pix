import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

export default Component.extend({

  session: inject(),
  store: inject(),

  email: null,
  password: null,
  isLoading: false,
  isPasswordVisible: false,
  errorMessage: null,

  passwordInputType: computed('isPasswordVisible', function() {
    return this.isPasswordVisible ? 'text' : 'password';
  }),

  isErrorMessagePresent: false,

  actions: {
    async authenticate() {
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
    },

    togglePasswordVisibility() {
      this.toggleProperty('isPasswordVisible');
    }

  },

  _authenticate(password, email) {
    const scope = 'pix-orga';
    return this.session.authenticate('authenticator:oauth2', email, password, scope)
      .catch((error) => {
        this.set('isErrorMessagePresent', true);
        if (error && error.errors && error.errors.length > 0) {
          this.set('errorMessage', error.errors[0].detail);
        } else {
          this.set('errorMessage','L\'adresse e-mail et/ou le mot de passe saisis sont incorrects.');
        }
      })
      .finally(() => {
        this.set('isLoading', false);
      });
  },

  _acceptOrganizationInvitation(organizationInvitationId, organizationInvitationCode, email) {
    const status = 'accepted';
    return this.store.createRecord('organization-invitation-response', {
      id: organizationInvitationId + '_' + organizationInvitationCode,
      code: organizationInvitationCode,
      status,
      email,
    }).save({ adapterOptions: { organizationInvitationId } });
  },

});
