import PixAccordions from '@1024pix/pix-ui/components/pix-accordions';
import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import htmlUnsafe from 'mon-pix/helpers/html-unsafe';
import Training from 'mon-pix/models/training';

import RegistrationCardTag from './registration-card-tag';

export default class CardModal extends Component {
  @service locale;
  @service store;

  @tracked isTrainingRecommendationRelevant = null;

  firedAccordions = new Set();

  constructor(...args) {
    super(...args);
    this.isTrainingRecommendationRelevant = this.args.training.isRelevant ?? null;
  }

  get formattedDuration() {
    return Training.formatDuration({ locale: this.locale.currentLanguage, duration: this.args.training.duration });
  }

  get isPositiveFeedback() {
    return this.isTrainingRecommendationRelevant === true;
  }

  get isNegativeFeedback() {
    return this.isTrainingRecommendationRelevant === false;
  }

  @action async submitFeedback(feedbackResponse) {
    this.isTrainingRecommendationRelevant = feedbackResponse;
    const campaignParticipationId = this.args.training.belongsTo('campaignParticipation').id();
    const adapter = this.store.adapterFor('training');
    await adapter.updateRelevance({
      campaignParticipationId,
      trainingId: this.args.training.id,
      isRelevant: feedbackResponse,
    });
  }

  @action onModalButtonClick() {
    this.args.onModalButtonClick({ trainingId: this.args.training.id });
  }

  @action onModalAccordionClick(accordionName) {
    if (this.firedAccordions.has(accordionName)) return;
    this.firedAccordions.add(accordionName);
    this.args.onModalAccordionClick({ trainingId: this.args.training.id, accordionName });
  }

  <template>
    <PixModal
      @title={{@training.title}}
      @showModal={{@isOpen}}
      @onCloseButtonClick={{@onClose}}
      class="results-recommendation-engine-training-card-modal"
    >
      <:content>
        <div class="results-recommendation-engine-training-card-modal__section">
          <dl class="results-recommendation-engine-training-card-modal-section__description">
            <RegistrationCardTag @registrationRequired={{@training.registrationRequired}} />
            <dt>{{t "pages.skill-review.recommended-engine.modal.editor-name"}}<span>{{@training.editorName}}</span>
            </dt>
            <dd>{{htmlUnsafe @training.description}}</dd>
          </dl>
          <div class="results-recommendation-engine-training-card-modal-section__information">
            {{#if @training.hasDuration}}
              <dl class="results-recommendation-engine-training-card-modal-section__time-information">
                <PixIcon @name="time" @ariaHidden={{true}} />
                <dt>{{t "pages.skill-review.recommended-engine.modal.duration"}}</dt>
                <dd class="results-recommendation-engine-training-card-modal-section__time-information--bold">
                  <span>{{this.formattedDuration}}</span>
                </dd>
              </dl>
            {{/if}}
            <dl class="results-recommendation-engine-training-card-modal-section__localisation-information">
              <PixIcon @name="mapPin" @ariaHidden={{true}} />
              <dt>{{t "pages.skill-review.recommended-engine.modal.localisation"}}</dt>
              <dd
                class="results-recommendation-engine-training-card-modal-section__time-information results-recommendation-engine-training-card-modal-section__localisation-information--bold"
              >{{@deliveryMode}}</dd>
            </dl>
          </div>
        </div>

        {{#if @training.objectives}}
          <PixAccordions @isV2Version={{true}} {{on "click" (fn this.onModalAccordionClick "OBJECTIVES")}}>
            <:title>
              <h2>{{t "pages.skill-review.recommended-engine.modal.objectives"}}</h2>
            </:title>
            <:content>
              <ul class="results-recommendation-engine-training-card-modal__objectives">
                {{#each @training.objectives as |objective|}}
                  <li>
                    <PixIcon
                      @name="checkCircle"
                      @plainIcon={{true}}
                      class="results-recommendation-engine-training-card-modal-objectives__icon"
                      @ariaHidden={{true}}
                    />
                    {{htmlUnsafe objective}}
                  </li>
                {{/each}}
              </ul>
            </:content>
          </PixAccordions>
        {{/if}}
        {{#if @training.program}}
          <PixAccordions @isV2Version={{true}} {{on "click" (fn this.onModalAccordionClick "PROGRAM")}}>
            <:title>
              <h2>{{t "pages.skill-review.recommended-engine.modal.program"}}</h2>
            </:title>
            <:content>
              <p class="results-recommendation-engine-training-card-modal__program">{{@training.program}}</p>
            </:content>
          </PixAccordions>
        {{/if}}
      </:content>
      <:footer>
        <div class="results-recommendation-engine-training-card-modal-footer">
          <form>
            <fieldset class="results-recommendation-engine-training-card-modal-footer__feedback">
              <legend>{{t "pages.skill-review.recommended-engine.modal.feedback.question"}}</legend>
              <PixIconButton
                @ariaLabel={{t "common.yes"}}
                @iconName="thumbUp"
                @triggerAction={{fn this.submitFeedback true}}
                @size="small"
                class={{if this.isPositiveFeedback "selected"}}
              />
              <PixIconButton
                @ariaLabel={{t "common.no"}}
                @iconName="dislike"
                @triggerAction={{fn this.submitFeedback false}}
                @size="small"
                class={{if this.isNegativeFeedback "selected"}}
              />
            </fieldset>
          </form>
          <ul class="results-recommendation-engine-training-card-modal-footer__action-buttons">
            <li>
              <PixButton
                @triggerAction={{@onClose}}
                @variant="secondary"
                class="results-recommendation-engine-training-card-modal-footer-action-buttons__cancel"
              >
                {{t "common.actions.close"}}
              </PixButton>
            </li>
            <li>
              <PixButtonLink
                {{on "click" this.onModalButtonClick}}
                @href={{@training.link}}
                target="_blank"
                rel="noreferrer"
                class="results-recommendation-engine-training-card-modal-footer-action-buttons__link"
              >
                {{#if @training.isModulix}}
                  {{t "pages.skill-review.recommended-engine.modal.actions.discover-module"}}
                {{else}}
                  {{t "pages.skill-review.recommended-engine.modal.actions.discover-program"}}
                  <PixIcon @name="openNew" @title={{t "navigation.external-link-title"}} />
                {{/if}}
              </PixButtonLink>
            </li>
          </ul>
        </div>
      </:footer>
    </PixModal>
  </template>
}
