import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import ENV from 'mon-pix/config/environment';

import SatisfactionScore from './drawer/satisfaction-score';
import ThankYou from './drawer/thank-you';

export default class Drawer extends Component {
  @service requestManager;

  @tracked isHidden = false;
  @tracked isHiding = false;
  @tracked isSubmitted = false;

  @action
  async selectScore(score) {
    this.isSubmitted = true;
    try {
      await this.requestManager.request({
        url: `${ENV.APP.API_HOST}/api/user-campaign-surveys`,
        method: 'POST',
        body: JSON.stringify({
          data: {
            type: 'user-campaign-surveys',
            attributes: {
              'campaign-id': this.args.campaignId,
              'satisfaction-score': score,
            },
          },
        }),
      });
    } catch {
      // L'échec de l'appel API n'interrompt pas le flux UI
    }
  }

  @action
  hide() {
    this.isHiding = true;
  }

  @action
  onAnimationEnd(event) {
    if (event.animationName === 'drawer-slide-down') {
      this.isHidden = true;
      this.isHiding = false;
    }
  }

  <template>
    {{#unless this.isHidden}}
      <section
        class="results-recommendation-engine-drawer {{if this.isHiding 'results-recommendation-engine-drawer--hiding'}}"
        {{on "animationend" this.onAnimationEnd}}
        role="dialog"
        aria-label={{t "pages.skill-review.recommended-engine.drawer.title"}}
      >
        {{#if this.isSubmitted}}
          <ThankYou @onClose={{this.hide}} />
        {{else}}
          <SatisfactionScore @onScoreSelected={{this.selectScore}} @onHide={{this.hide}} />
        {{/if}}
      </section>
    {{/unless}}
  </template>
}
