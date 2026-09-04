import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import { hash } from '@ember/helper';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

export default class CampaignParticipationResetButton extends Component {
  @tracked isResetModalVisible = false;

  @action
  toggleResetModalVisibility() {
    this.isResetModalVisible = !this.isResetModalVisible;
  }

  <template>
    <PixButton @iconBefore="refresh" @variant="tertiary-white" @triggerAction={{this.toggleResetModalVisibility}}>
      {{t "pages.skill-review.hero.retry.actions.reset"}}
    </PixButton>
    <PixModal
      class="evaluation-results-hero-recommendation-engine-reset-modal"
      @title={{t "pages.skill-review.reset.button"}}
      @showModal={{this.isResetModalVisible}}
      @onCloseButtonClick={{this.toggleResetModalVisibility}}
    >
      <:content>
        <p class="evaluation-results-hero-recommendation-engine-reset-modal__text">
          {{t "pages.skill-review.reset.modal.text" targetProfileName=@campaign.targetProfileName htmlSafe=true}}
        </p>
        <PixNotificationAlert @type="warning">{{t "pages.skill-review.reset.modal.warning-text"}}</PixNotificationAlert>
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
              @query={{hash reset=true}}
              @variant="error"
            >
              {{t "common.actions.confirm"}}
            </PixButtonLink>
          </li>
        </ul>
      </:footer>
    </PixModal>
  </template>
}
