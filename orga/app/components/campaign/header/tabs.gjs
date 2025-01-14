import PixButton from '@1024pix/pix-ui/components/pix-button';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class CampaignTabs extends Component {
  @service intl;
  @service notifications;
  @service fileSaver;
  @service session;
  @service metrics;
  //TODO: check if something is wrong here or in config
  @action
  async exportData() {
    try {
      const token = this.session.data.authenticated.access_token;
      await this.fileSaver.save({ url: this.args.campaign.urlToResult, token });
      this.metrics.add({
        event: 'custom-event',
        'pix-event-category': 'Campagnes',
        'pix-event-action': "Cliquer sur le bouton d'export des résultats d'une campagne",
        'pix-event-name': "Clic sur le bouton d'export",
      });
    } catch {
      this.notifications.sendError(this.intl.t('api-error-messages.global'));
    }
  }

  <template>
    <div class="panel campaign-header-tabs">
      <nav class="navbar" aria-label={{t "navigation.campaign-page.aria-label"}}>
        <LinkTo @route="authenticated.campaigns.campaign.activity" @model={{@campaign}} class="navbar-item">
          {{t "pages.campaign.tab.activity"}}
        </LinkTo>

        <LinkTo
          @route={{if
            @campaign.isTypeAssessment
            "authenticated.campaigns.campaign.assessment-results"
            "authenticated.campaigns.campaign.profile-results"
          }}
          @model={{@campaign}}
          class="navbar-item"
        >
          {{t "pages.campaign.tab.results" count=@campaign.sharedParticipationsCount}}
        </LinkTo>

        {{#if @campaign.isTypeAssessment}}
          <LinkTo @route="authenticated.campaigns.campaign.analysis" class="navbar-item" @model={{@campaign}}>
            {{t "pages.campaign.tab.review"}}
          </LinkTo>
        {{/if}}

        <div class="navbar-item-separator hide-on-mobile" aria-hidden="true"></div>
        <LinkTo @route="authenticated.campaigns.campaign.settings" class="navbar-item" @model={{@campaign}}>
          {{t "pages.campaign.tab.settings"}}
        </LinkTo>
      </nav>

      <div class="campaign-header-tabs__export-button hide-on-mobile">
        <PixButton @variant="primary" @triggerAction={{this.exportData}}>
          {{t "pages.campaign.actions.export-results"}}
        </PixButton>
      </div>
    </div>
  </template>
}
