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
  passwordInputType: computed('isPasswordVisible', function() {
    return this.isPasswordVisible ? 'text' : 'password';
  }),

  isErrorMessagePresent: false,

  actions: {
    async authenticate() {
      this.set('isLoading', true);
      const email = this.email;
      const password = this.password;

      if (this.isWithInvitation) {
        await this._acceptOrganizationInvitation(this.organizationInvitationId, this.organizationInvitationCode, email);
      }

      const scope = 'pix-orga';
      return this.session.authenticate('authenticator:oauth2', email, password, scope)
        .catch(() => {
          this.set('isErrorMessagePresent', true);
        })
        .finally(() => {
          this.set('isLoading', false);
        });
    },

    togglePasswordVisibility() {
      this.toggleProperty('isPasswordVisible');
    }

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
