import { PixButton, PixButtonLink } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import MissionBanner from 'pix-orga/components/banner/mission-banner';
import OrganizationInfo from 'pix-orga/components/index/organization-information';
import Welcome from 'pix-orga/components/index/welcome';

import ActionCardsList from './action-cards-list';
import ActionCardsListItem from './action-cards-list-item';

export default class IndexMissions extends Component {
  @service currentUser;
  @service intl;
  @service url;
  @service store;
  @service session;
  @service router;

  get description() {
    return this.intl.t('components.index.welcome.description.missions');
  }

  get isSessionActive() {
    return this.currentUser.organization.sessionExpirationDate > new Date();
  }

  @action
  async activateSession() {
    const organization = this.currentUser.organization;
    await this.store
      .adapterFor('organization')
      .activateSession({ organizationId: organization.id, token: this.session?.data?.authenticated?.access_token });

    await this.currentUser.load();
  }

  <template>
    <Welcome @firstName={{this.currentUser.prescriber.firstName}} @description={{this.description}} />
    <MissionBanner
      @isAdmin={{this.currentUser.isAdminInOrganization}}
      @pixJuniorSchoolUrl={{this.url.pixJuniorSchoolUrl}}
      @pixJuniorUrl={{this.url.pixJuniorUrl}}
      @schoolCode={{this.currentUser.organization.schoolCode}}
    />
    <OrganizationInfo @organizationName={{this.currentUser.organization.name}} />
    <ActionCardsList>

      {{#if this.isSessionActive}}

        <ActionCardsListItem
          @title={{t "components.index.action-cards.missions.launch-session.title"}}
          @description={{t "components.index.action-cards.missions.launch-session.description" htmlSafe=true}}
        >
          <PixButton @variant="secondary" type="button" @triggerAction={{this.activateSession}}>
            {{t "components.index.action-cards.missions.extend-session.buttonText"}}
          </PixButton>
        </ActionCardsListItem>

      {{else}}

        <ActionCardsListItem
          @title={{t "components.index.action-cards.missions.launch-session.title"}}
          @description={{t "components.index.action-cards.missions.launch-session.description" htmlSafe=true}}
        >
          <PixButton @variant="secondary" type="button" @triggerAction={{this.activateSession}}>
            {{t "components.index.action-cards.missions.launch-session.buttonText"}}
          </PixButton>
        </ActionCardsListItem>

      {{/if}}

      <ActionCardsListItem
        @title={{t "components.index.action-cards.missions.follow-activity.title"}}
        @description={{t "components.index.action-cards.missions.follow-activity.description"}}
      >
        <PixButtonLink @variant="secondary" type="button" @route="authenticated.missions.list">
          {{t "components.index.action-cards.missions.follow-activity.buttonText"}}
        </PixButtonLink>
      </ActionCardsListItem>

    </ActionCardsList>
  </template>
}
