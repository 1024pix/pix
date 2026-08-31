import PixBannerAlert from '@1024pix/pix-ui/components/pix-banner-alert';
import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

export default class EvaluationResultsHeroRetryOrResetBlock extends Component {
  @service pixMetrics;
  @service intl;
  @service featureToggles;
  @tracked isResetModalVisible = false;

  retryQueryParams = { retry: true };
  resetQueryParams = { reset: true };

  constructor() {
    super(...arguments);
    if (this.args.campaignParticipationResult.canRetry) {
      this.pixMetrics.trackEvent("Présence du bouton 'Repasser un parcours'", {
        disabled: true,
        category: 'Fin de parcours',
        action: 'Affichage du bloc RAZ/Repasser un parcours',
      });
    }

    if (this.args.campaignParticipationResult.canReset) {
      this.pixMetrics.trackEvent("Présence du bouton 'Remettre à zéro et tout retenter'", {
        disabled: true,
        category: 'Fin de parcours',
        action: 'Affichage du bloc RAZ/Repasser un parcours',
      });
    }
  }

  @action
  handleRetryClick() {
    this.pixMetrics.trackEvent("Clic sur le bouton 'Repasser mon parcours'", {
      disabled: true,
      category: 'Fin de parcours',
      action: 'Affichage du bloc RAZ/Repasser un parcours',
    });
  }

  @action
  toggleResetModalVisibility() {
    if (!this.isResetModalVisible) {
      this.pixMetrics.trackEvent("Ouverture de la modale 'Remettre à zéro et tout retenter'", {
        disabled: true,
        category: 'Fin de parcours',
        action: 'Affichage du bloc RAZ/Repasser un parcours',
      });
    }

    this.isResetModalVisible = !this.isResetModalVisible;
  }

  @action
  handleResetClick() {
    this.pixMetrics.trackEvent("Confirmation de la modale 'Remettre à zéro et tout retenter'", {
      disabled: true,
      category: 'Fin de parcours',
      action: 'Affichage du bloc RAZ/Repasser un parcours',
    });
  }

  get retryOrResetExplanation() {
    const { canRetry, canReset } = this.args.campaignParticipationResult;
    const suffix = 'notification';

    if (canReset && canRetry) {
      return this.intl.t(`pages.skill-review.retry-and-reset.${suffix}`);
    } else if (!canReset && canRetry) {
      return this.intl.t(`pages.skill-review.retry.${suffix}`);
    } else if (canReset && !canRetry) {
      return this.intl.t(`pages.skill-review.reset.${suffix}`);
    } else return '';
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
              onclick={{this.handleRetryClick}}
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
                <PixBannerAlert @type="warning">{{t "pages.skill-review.reset.modal.warning-text"}}</PixBannerAlert>
                <p class="reset-campaign-participation-modal__text">
                  {{t
                    "pages.skill-review.reset.modal.text"
                    targetProfileName=@campaign.targetProfileName
                    htmlSafe=true
                  }}
                </p>
              </:content>
              <:footer>
                <ul class="reset-campaign-participation-modal__footer">
                  <li>
                    <PixButton @variant="secondary" @triggerAction={{this.toggleResetModalVisibility}}>
                      {{t "common.actions.cancel"}}
                    </PixButton>
                  </li>
                  <li>
                    <PixButtonLink
                      @route="campaigns.entry-point"
                      @model={{@campaign.code}}
                      @query={{this.resetQueryParams}}
                      @variant="error"
                      onclick={{this.handleResetClick}}
                    >
                      {{t "common.actions.confirm"}}
                    </PixButtonLink>
                  </li>
                </ul>
              </:footer>
            </PixModal>
          {{/if}}
        </div>
        <PixNotificationAlert class="evaluation-results-hero-retry__message" @withIcon={{true}}>
          {{this.retryOrResetExplanation}}
        </PixNotificationAlert>
      </div>
    </div>
  </template>
}
