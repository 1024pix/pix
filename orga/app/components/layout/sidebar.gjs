import PixNavigation from '@1024pix/pix-ui/components/pix-navigation';
import PixNavigationButton from '@1024pix/pix-ui/components/pix-navigation-button';
import PixNavigationSeparator from '@1024pix/pix-ui/components/pix-navigation-separator';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import OrganizationPlacesOrCreditInfo from './organization-places-or-credit-info';
import SchoolSessionManagement from './school-session-management';
import UserLoggedMenu from './user-logged-menu';

export default class SidebarMenu extends Component {
  @service currentUser;
  @service url;

  @tracked canShowCredit;

  handleCanShowCredit = (value) => {
    this.canShowCredit = value;
  };

  get redirectionRoute() {
    if (this.shouldDisplayMissionsEntry) {
      return 'authenticated.missions';
    } else {
      return 'authenticated.campaigns';
    }
  }

  get documentationUrl() {
    return this.currentUser.organization.documentationUrl;
  }

  get shouldDisplayCertificationsEntry() {
    return this.currentUser.isAdminInOrganization && this.currentUser.isSCOManagingStudents;
  }

  get shouldDisplayAttestationsEntry() {
    return this.currentUser.canAccessAttestationsPage;
  }

  get shouldDisplayPlacesEntry() {
    return this.currentUser.canAccessPlacesPage;
  }

  get shouldDisplayMissionsEntry() {
    return this.currentUser.canAccessMissionsPage;
  }

  get shouldDisplayCampaignsEntry() {
    return this.currentUser.canAccessCampaignsPage;
  }

  get shouldDisplayStatisticsEntry() {
    return this.currentUser.canAccessStatisticsPage;
  }

  get shouldDisplaySeparator() {
    return this.shouldDisplayMissionsEntry || this.shouldDisplayPlacesEntry || this.canShowCredit;
  }

  get organizationLearnersList() {
    if (this.currentUser.isSCOManagingStudents) {
      return {
        route: 'authenticated.sco-organization-participants',
        label: 'navigation.main.sco-organization-participants',
      };
    } else if (this.currentUser.isSUPManagingStudents) {
      return {
        route: 'authenticated.sup-organization-participants',
        label: 'navigation.main.sup-organization-participants',
      };
    } else if (this.currentUser.canAccessMissionsPage) {
      return {
        route: 'authenticated.organization-participants',
        label: 'navigation.main.sco-organization-participants',
      };
    } else {
      return {
        route: 'authenticated.organization-participants',
        label: 'navigation.main.organization-participants',
      };
    }
  }

  <template>
    <PixNavigation
      @variant="orga"
      @navigationAriaLabel={{t "navigation.main.aria-label"}}
      @openLabel={{t "navigation.main.open"}}
      @closeLabel={{t "navigation.main.close"}}
    >
      <:brand>
        <LinkTo @route={{this.redirectionRoute}}>
          <img src="{{this.rootUrl}}/pix-orga.svg" class="pix-orga-logo" alt="{{t 'common.home-page'}}" />
        </LinkTo>
      </:brand>
      <:navElements>
        {{#if this.shouldDisplayCampaignsEntry}}
          <PixNavigationButton @route={{this.redirectionRoute}} @icon="conversionPath">
            {{t "navigation.main.campaigns"}}</PixNavigationButton>
        {{/if}}

        {{#if this.shouldDisplayCertificationsEntry}}
          <PixNavigationButton @route="authenticated.certifications" @icon="awards">
            {{t "navigation.main.certifications"}}</PixNavigationButton>
        {{/if}}

        {{#if this.shouldDisplayAttestationsEntry}}
          <PixNavigationButton @route="authenticated.attestations" @icon="assignment">
            {{t "navigation.main.attestations"}}</PixNavigationButton>
        {{/if}}

        {{#if this.shouldDisplayMissionsEntry}}
          <PixNavigationButton @route="authenticated.missions" @icon="conversionPath">
            {{t "navigation.main.missions"}}
          </PixNavigationButton>
        {{/if}}

        <PixNavigationButton @route={{this.organizationLearnersList.route}} @icon="infoUser">
          {{t this.organizationLearnersList.label}}
        </PixNavigationButton>

        <PixNavigationButton @route="authenticated.team" @icon="users">
          {{t "navigation.main.team"}}
        </PixNavigationButton>

        {{#if this.shouldDisplayPlacesEntry}}
          <PixNavigationButton @route="authenticated.places" @icon="seat">
            {{t "navigation.main.places"}}
          </PixNavigationButton>
        {{/if}}

        {{#if this.shouldDisplayStatisticsEntry}}
          <PixNavigationButton @route="authenticated.statistics" @icon="monitoring">
            {{t "navigation.main.statistics"}}
          </PixNavigationButton>
        {{/if}}

        {{#if this.documentationUrl}}
          <PixNavigationButton href={{this.documentationUrl}} @target="_blank" rel="noopener noreferrer" @icon="book">
            {{t "navigation.main.documentation"}}
          </PixNavigationButton>
        {{/if}}

        {{#if this.shouldDisplayMissionsEntry}}
          <PixNavigationButton
            href="https://pix.fr/support/enseignement-scolaire/1er-degre"
            @target="_blank"
            rel="noopener noreferrer"
            @icon="help"
          >
            {{t "navigation.main.support"}}
          </PixNavigationButton>
        {{/if}}
      </:navElements>
      <:footer>
        <OrganizationPlacesOrCreditInfo @placesCount={{@placesCount}} @onCanShowCredit={{this.handleCanShowCredit}} />
        <SchoolSessionManagement />
        {{#if this.shouldDisplaySeparator}}
          <PixNavigationSeparator />
        {{/if}}
        <UserLoggedMenu @onChangeOrganization={{@onChangeOrganization}} />
      </:footer>
    </PixNavigation>
  </template>
}
