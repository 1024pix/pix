import { PixButtonLink } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import ActionCardsList from 'pix-orga/components/index/action-cards-list';
import ActionCardsListItem from 'pix-orga/components/index/action-cards-list-item';
import OrganizationInfo from 'pix-orga/components/index/organization-information';
import ParticipationStatistics from 'pix-orga/components/index/participation-statistics';
import Welcome from 'pix-orga/components/index/welcome';

import { EVENT_NAME } from '../../helpers/metrics-event-name';

export default class IndexClassic extends Component {
  @service currentUser;
  @service intl;
  @service locale;
  @service pixMetrics;
  @service store;

  get description() {
    return this.intl.t('components.index.welcome.description.classic');
  }

  get scoBannerContent() {
    const content = this.store.peekRecord('announcement', 'SCO')?.content;
    return content?.[this.locale.currentLanguage] ?? null;
  }

  @action
  trackEvent(eventName) {
    this.pixMetrics.trackEvent(eventName);
  }

  <template>
    <Welcome
      @firstName={{this.currentUser.prescriber.firstName}}
      @description={{this.description}}
      @displayScoBanner={{this.currentUser.isSCOManagingStudents}}
      @scoBannerContent={{this.scoBannerContent}}
    />

    <OrganizationInfo @organizationName={{this.currentUser.organization.name}} />

    <ParticipationStatistics @participationStatistics={{this.currentUser.participationStatistics}} />

    <ActionCardsList>

      <ActionCardsListItem
        @title={{t "components.index.action-cards.classic.create-campaign.title"}}
        @description={{t "components.index.action-cards.classic.create-campaign.description"}}
      >
        <PixButtonLink
          @variant="secondary"
          type="button"
          @route="authenticated.campaigns.new"
          {{on "click" (fn this.trackEvent EVENT_NAME.HOMEPAGE.CREATE_CAMPAIGN_CLICK)}}
        >
          {{t "components.index.action-cards.classic.create-campaign.buttonText"}}
        </PixButtonLink>
      </ActionCardsListItem>

      <ActionCardsListItem
        @title={{t "components.index.action-cards.classic.follow-activity.title"}}
        @description={{t "components.index.action-cards.classic.follow-activity.description"}}
      >
        <PixButtonLink
          @variant="secondary"
          type="button"
          @route="authenticated.campaigns.list.my-campaigns"
          {{on "click" (fn this.trackEvent EVENT_NAME.HOMEPAGE.LIST_CAMPAIGNS_CLICK)}}
        >
          {{t "components.index.action-cards.classic.follow-activity.buttonText"}}
        </PixButtonLink>
      </ActionCardsListItem>

    </ActionCardsList>
  </template>
}
