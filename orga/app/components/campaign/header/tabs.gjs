import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixTabs from '@1024pix/pix-ui/components/pix-tabs';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import { or } from 'ember-truth-helpers';

import { EVENT_NAME } from '../../../helpers/metrics-event-name';

export default class CampaignTabs extends Component {
  @service intl;
  @service notifications;
  @service fileSaver;
  @service session;
  @service pixMetrics;
  @service store;
  @service currentUser;

  get hasReachedPlacesLimit() {
    return this.currentUser.placeStatistics?.hasReachedMaximumPlacesLimit;
  }

  @action
  async exportData() {
    try {
      const token = this.session.data.authenticated.access_token;
      await this.fileSaver.save({ url: this.args.campaign.urlToResult, token });
      this.pixMetrics.trackEvent(EVENT_NAME.CAMPAIGN.EXPORT_DATA_CLICK);
    } catch {
      this.pixToast.sendErrorNotification({ message: this.intl.t('api-error-messages.global') });
    }
  }

  <template>
    <div class="campaign-header-tabs">
      <PixTabs @variant="orga" @ariaLabel={{t "navigation.campaign-page.aria-label"}}>
        <LinkTo @route="authenticated.campaigns.campaign.activity" @model={{@campaign}}>
          {{t "pages.campaign.tab.activity"}}
        </LinkTo>

        <LinkTo
          @disabled={{this.hasReachedPlacesLimit}}
          @route={{if
            (or @campaign.isTypeAssessment @campaign.isTypeExam)
            "authenticated.campaigns.campaign.assessment-results"
            "authenticated.campaigns.campaign.profile-results"
          }}
          @model={{@campaign}}
        >
          {{t "pages.campaign.tab.results" count=@campaign.sharedParticipationsCount}}
        </LinkTo>

        {{#if (or @campaign.isTypeAssessment @campaign.isTypeExam)}}
          <LinkTo
            @disabled={{this.hasReachedPlacesLimit}}
            @route="authenticated.campaigns.campaign.analysis"
            @model={{@campaign}}
          >
            {{t "pages.campaign.tab.review"}}
          </LinkTo>
        {{/if}}

        {{#unless @campaign.isFromCombinedCourse}}
          <LinkTo @route="authenticated.campaigns.campaign.settings" @model={{@campaign}}>
            {{t "pages.campaign.tab.settings"}}
          </LinkTo>
        {{/unless}}
      </PixTabs>

      <div class="campaign-header-tabs__export-button hide-on-mobile">
        <PixButton @isDisabled={{this.hasReachedPlacesLimit}} @variant="primary" @triggerAction={{this.exportData}}>
          {{t "pages.campaign.actions.export-results"}}
        </PixButton>
      </div>
    </div>
  </template>
}
