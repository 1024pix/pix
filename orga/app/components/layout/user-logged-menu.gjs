import { PixButtonLink, PixStructureSwitcher } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class UserLoggedMenu extends Component {
  @service currentUser;
  @service router;
  @service store;

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
      .map((membership) => {
        let label = `${membership.organization.get('name')}`;

        if (membership.organization.get('externalId')) {
          label = label.concat(` (${membership.organization.get('externalId')})`);
        }

        return {
          label,
          value: membership.organization.get('id'),
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  get belongsToSeveralOrganizations() {
    return this.eligibleOrganizations.length > 1;
  }

  @action
  async onOrganizationChange(organization) {
    const prescriber = this.currentUser.prescriber;
    const userOrgaSettingsId = prescriber.userOrgaSettings.get('id');

    const userOrgaSettings = await this.store.peekRecord('user-orga-setting', userOrgaSettingsId);
    const selectedOrganization = await this.store.peekRecord('organization', organization.value);

    userOrgaSettings.organization = selectedOrganization;
    await userOrgaSettings.save({ adapterOptions: { userId: prescriber.id } });

    this.router.replaceWith('authenticated.index');

    await this.currentUser.load();
  }

  <template>
    <p>
      <strong>
        {{this.currentUser.prescriber.firstName}}
        {{this.currentUser.prescriber.lastName}}
      </strong>
      <br />
      {{this.organizationNameAndExternalId}}
    </p>
    {{#if this.belongsToSeveralOrganizations}}
      <PixStructureSwitcher
        @value={{this.currentUser.organization.id}}
        @structures={{this.eligibleOrganizations}}
        @label={{t "navigation.user-logged-menu.button"}}
        @onChange={{this.onOrganizationChange}}
      />
    {{/if}}
    <PixButtonLink @variant="tertiary" class="" @route="logout">{{t
        "navigation.user-logged-menu.logout"
      }}</PixButtonLink>
  </template>
}
