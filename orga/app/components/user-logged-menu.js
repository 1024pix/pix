import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default class UserLoggedMenu extends Component {

  @service currentUser;
  @service router;
  @service store;

  isMenuOpen = false;

  @computed('currentUser.organization.name')
  get organizationNameAndExternalId() {
    const organization = this.currentUser.organization;
    if (organization.externalId) {
      return `${organization.name} (${organization.externalId})`;
    }
    return organization.name;
  }

  @computed('currentUser.organization')
  get eligibleOrganizations() {
    const memberships = this.currentUser.memberships;
    if (!memberships) {
      return [];
    }
    return memberships.toArray()
      .map((membership) => membership.organization)
      .filter((organization) => organization.get('id') !== this.currentUser.organization.id)
      .sort((a, b) => a.get('name').localeCompare(b.get('name')));
  }

  @action
  toggleUserMenu() {
    this.toggleProperty('isMenuOpen');
  }

  @action
  closeMenu() {
    this.set('isMenuOpen', false);
  }

  @action
  async onOrganizationChange(organization) {
    const user = this.currentUser.user;
    const userOrgaSettingsId = user.userOrgaSettings.get('id');

    const userOrgaSettings = await this.store.peekRecord('user-orga-setting', userOrgaSettingsId);
    const selectedOrganization = await this.store.peekRecord('organization', organization.get('id'));

    userOrgaSettings.set('organization', selectedOrganization);
    userOrgaSettings.save({ adapterOptions: { userId: user.id } });

    await this.currentUser.load();

    const queryParams = {};
    Object.keys(this.router.currentRoute.queryParams).forEach((key) => queryParams[key] = undefined);
    this.router.replaceWith('authenticated', { queryParams });
  }
}
