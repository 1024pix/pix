import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({

  currentUser: service(),
  router: service(),

  isMenuOpen: false,
  
  organizationNameAndExternalId: computed('currentUser.organization.name', function() {
    const organization = this.currentUser.organization;
    if (!organization) {
      return '';
    }
    if (organization.externalId) {
      return `${organization.name} (${organization.externalId})`;
    }
    return organization.name;
  }),

  actions: {
    toggleUserMenu() {
      this.toggleProperty('isMenuOpen');
    },

    closeMenu() {
      this.set('isMenuOpen', false);
    },

    async onOrganizationChange(organizationId) {
      await this.currentUser.updateMainOrganization(organizationId);
      this.router.replaceWith('/');
    }
  }

});
