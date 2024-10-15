import PixBanner from '@1024pix/pix-ui/components/pix-banner';
import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixMessage from '@1024pix/pix-ui/components/pix-message';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

export default class EvaluationResultsHeroRetryOrResetBlock extends Component {
  @tracked isImproveButtonLoading = false;
  @tracked isResetModalVisible = false;

  retryQueryParams = { retry: true };
  resetQueryParams = { reset: true };

  @action
  async improveResults() {
    if (this.isImproveButtonLoading) return;

    try {
      this.isImproveButtonLoading = true;
      const campaignParticipationResult = this.args.model.campaignParticipationResult;
      const adapter = this.store.adapterFor('campaign-participation-result');
      await adapter.beginImprovement(campaignParticipationResult.id);
      this.router.transitionTo('campaigns.entry-point', this.args.campaign.code);
    } finally {
      this.isImproveButtonLoading = false;
    }
  }

  @action
  toggleResetModalVisibility() {
    this.isResetModalVisible = !this.isResetModalVisible;
  }

  <template>
    <div class="evaluation-results-hero__retry">
      <div class="evaluation-results-hero-retry__content">
        <h2 class="evaluation-results-hero-retry__title">
          {{t "pages.skill-review.hero.retry.title"}}
        </h2>
        <p class="evaluation-results-hero-retry__description">
          {{t "pages.skill-review.hero.retry.description"}}
        </p>
        <div class="evaluation-results-hero-retry__actions">
          {{#if @campaignParticipationResult.canRetry}}
            <PixButtonLink
              @variant="secondary"
              @route="campaigns.entry-point"
              @model={{@campaign.code}}
              @query={{this.retryQueryParams}}
            >
              {{t "pages.skill-review.hero.retry.actions.retry"}}
            </PixButtonLink>
          {{/if}}
          {{#if @campaignParticipationResult.canReset}}
            <PixButton @variant="tertiary" @triggerAction={{this.toggleResetModalVisibility}}>
              {{t "pages.skill-review.hero.retry.actions.reset"}}
            </PixButton>
            <PixModal
              @title={{t "pages.skill-review.reset.button"}}
              @showModal={{this.isResetModalVisible}}
              @onCloseButtonClick={{this.toggleResetModalVisibility}}
            >
              <:content>
                <PixBanner @type="warning">{{t "pages.skill-review.reset.modal.warning-text"}}</PixBanner>
                <p class="reset-campaign-participation-modal__text">
                  {{t
                    "pages.skill-review.reset.modal.text"
                    targetProfileName=@campaign.targetProfileName
                    htmlSafe=true
                  }}
                </p>
              </:content>
              <:footer>
                <div class="reset-campaign-participation-modal__footer">
                  <PixButton @variant="secondary" @triggerAction={{this.toggleResetModalVisibility}}>
                    {{t "common.actions.cancel"}}
                  </PixButton>
                  <PixButtonLink
                    @route="campaigns.entry-point"
                    @model={{@campaign.code}}
                    @query={{this.resetQueryParams}}
                    @variant="error"
                  >
                    {{t "common.actions.confirm"}}
                  </PixButtonLink>
                </div>
              </:footer>
            </PixModal>
          {{/if}}
        </div>
        <PixMessage class="evaluation-results-hero-retry__message" @withIcon={{true}}>
          {{t "pages.skill-review.reset.notifications"}}
        </PixMessage>
      </div>
    </div>
  </template>
}
