import PixButton from '@1024pix/pix-ui/components/pix-button';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import modifierDidInsert from 'mon-pix/modifiers/modifier-did-insert';

export default class ThankYou extends Component {
  @action
  focusOnInsert(element) {
    element.focus();
  }

  <template>
    <div
      role="status"
      class="results-recommendation-engine-drawer__thank-you"
      tabindex="-1"
      {{modifierDidInsert this.focusOnInsert}}
    >
      <img
        src="/images/illustrations/results/sent-feedback.webp"
        alt=""
        aria-hidden="true"
        class="results-recommendation-engine-drawer__thank-you-icon"
      />
      <p class="results-recommendation-engine-drawer__thank-you-title">
        {{t "pages.skill-review.recommended-engine.drawer.thank-you.title"}}
      </p>
      <p class="results-recommendation-engine-drawer__thank-you-subtitle">
        {{t "pages.skill-review.recommended-engine.drawer.thank-you.subtitle"}}
      </p>
      <PixButton
        @variant="primary"
        @triggerAction={{@onClose}}
        aria-label={{t "pages.skill-review.recommended-engine.drawer.hide-aria-label"}}
      >
        {{t "common.actions.close"}}
      </PixButton>
    </div>
  </template>
}
