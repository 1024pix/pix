import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({

  classNames: ['logged-user-container'],

  currentUser: service(),
  store: service(),
  router: service(),

  isMenuOpen: false,

  organizationNameAndExternalId: computed('currentUser.organization.name', function() {
    const organization = this.currentUser.organization;
    if (organization.externalId) {
      return `${organization.name} (${organization.externalId})`;
    }
    return organization.name;
  }),

  eligibleOrganizations: computed('currentUser.organization', function() {
    const memberships = this.currentUser.memberships;
    if (!memberships) {
      return [];
    }
    return memberships.toArray()
      .map((membership) => membership.organization)
      .filter((organization) => organization.get('id') !== this.currentUser.organization.id)
      .sort((a, b) => a.get('name').localeCompare(b.get('name')));
  }),

  actions: {
    toggleUserMenu() {
      this.toggleProperty('isMenuOpen');
    },

    closeMenu() {
      this.set('isMenuOpen', false);
    },

    async onOrganizationChange(organization) {
      const user = this.currentUser.user;
      const userOrgaSettingsId = user.userOrgaSettings.get('id');

      const userOrgaSettings = await this.store.peekRecord('user-orga-setting', userOrgaSettingsId);
      const selectedOrganization = await this.store.peekRecord('organization', organization.get('id'));

      userOrgaSettings.set('organization', selectedOrganization);
      userOrgaSettings.save();

      await this.currentUser.load();

      const queryParams = {};
      Object.keys(this.router.currentRoute.queryParams).forEach((key) => queryParams[key] = undefined);
      this.router.replaceWith('authenticated', { queryParams });
    }
  }

});
