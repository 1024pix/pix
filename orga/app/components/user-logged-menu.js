import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({

  currentUser: service(),
  router: service(),

  isMenuOpen: false,

  organizations: computed('currentUser.organization', function() {
    const memberships = this.currentUser.memberships;
    if (!memberships) {
      return [];
    }
    return memberships.toArray()
      .map((membership) => membership.organization)
      .filter((organization) => organization.get('id') !== this.currentUser.organization.id)
      .sort((a, b) => a.get('name').localeCompare(b.get('name')));
  }),

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
