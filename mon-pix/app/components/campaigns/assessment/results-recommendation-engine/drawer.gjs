import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import ENV from 'mon-pix/config/environment';

import ContentRelevanceForm from './drawer/content-relevance-form';
import SatisfactionScore from './drawer/satisfaction-score';
import ThankYou from './drawer/thank-you';

export default class Drawer extends Component {
  @service requestManager;

  @tracked isHidden = false;
  @tracked isHiding = false;
  @tracked step = 'satisfaction-score';

  get isContentRelevanceFormStepDisplayed() {
    return this.step === 'content-relevance-form';
  }

  get isThankYouStepDisplayed() {
    return this.step === 'thank-you';
  }

  @action
  showThankYou() {
    this.step = 'thank-you';
  }

  @action
  async submitSatisfactionScore(score) {
    try {
      this.step = 'content-relevance-form';

      this.satisfactionScore = score;
      await this.requestManager.request({
        url: `${ENV.APP.API_HOST}/api/user-campaign-surveys`,
        method: 'PUT',
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
      // TODO Ajouter un PixToast d'erreur
    }
  }

  @action
  hide() {
    this.args.onHide?.();

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.finishHiding();
      return;
    }

    this.isHiding = true;
  }

  @action
  onAnimationEnd(event) {
    if (event.animationName === 'drawer-slide-down') {
      this.finishHiding();
    }
  }

  finishHiding() {
    this.isHidden = true;
    this.isHiding = false;
  }

  @action
  async submitContentRelevanceFormScores(scores) {
    try {
      await this.requestManager.request({
        url: `${ENV.APP.API_HOST}/api/user-campaign-surveys`,
        method: 'PUT',
        body: JSON.stringify({
          data: {
            type: 'user-campaign-surveys',
            attributes: {
              'campaign-id': this.args.campaignId,
              'satisfaction-score': this.satisfactionScore,
              'usefulness-score': scores.usefulness,
              'personalization-score': scores.personalization,
              'attractiveness-score': scores.attractiveness,
            },
          },
        }),
      });
      this.showThankYou();
    } catch {
      // TODO Ajouter un PixToast d'erreur
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
        {{#if this.isThankYouStepDisplayed}}
          <ThankYou @onClose={{this.hide}} />
        {{else if this.isContentRelevanceFormStepDisplayed}}
          <ContentRelevanceForm @onSubmit={{this.submitContentRelevanceFormScores}} @onHide={{this.hide}} />
        {{else}}
          <SatisfactionScore @onScoreSelected={{this.submitSatisfactionScore}} @onHide={{this.hide}} />
        {{/if}}
      </section>
    {{/unless}}
  </template>
}
