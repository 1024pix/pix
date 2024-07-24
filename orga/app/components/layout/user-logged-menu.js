import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class UserLoggedMenu extends Component {
  @service currentUser;
  @service router;
  @service store;

  @tracked isMenuOpen = false;

  get organizationNameAndExternalId() {
    const organization = this.currentUser.organization;
    if (organization.externalId) {
      return `${organization.name} (${organization.externalId})`;
    }
    return organization.name;
  }

  get eligibleOrganizations() {
    const memberships = this.currentUser.memberships;
    if (!memberships) {
      return [];
    }
    return memberships
      .slice()
      .map((membership) => membership.organization)
      .filter((organization) => organization.get('id') !== this.currentUser.organization.id)
      .sort((a, b) => a.get('name').localeCompare(b.get('name')));
  }

  @action
  toggleUserMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  @action
  closeMenu() {
    this.isMenuOpen = false;
  }

  @action
  async onOrganizationChange(organization) {
    const prescriber = this.currentUser.prescriber;
    const userOrgaSettingsId = prescriber.userOrgaSettings.get('id');

    const userOrgaSettings = await this.store.peekRecord('user-orga-setting', userOrgaSettingsId);
    const selectedOrganization = await this.store.peekRecord('organization', organization.get('id'));

    userOrgaSettings.organization = selectedOrganization;
    await userOrgaSettings.save({ adapterOptions: { userId: prescriber.id } });

    const queryParams = {};
    Object.keys(this.router.currentRoute.queryParams).forEach((key) => (queryParams[key] = undefined));
    this.router.replaceWith('authenticated', { queryParams });

    await this.currentUser.load();
    this.args.onChangeOrganization();

    this.closeMenu();
  }
}
