import PixAccordions from '@1024pix/pix-ui/components/pix-accordions';
import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import htmlUnsafe from 'mon-pix/helpers/html-unsafe';

import RegistrationCardTag from './registration-card-tag';

export default class CardModal extends Component {
  @tracked isTrainingRecommendationRelevant = null;

  @action
  submitFeedback(feedbackResponse) {
    this.isTrainingRecommendationRelevant = feedbackResponse;
    //TODO call API to submit feedback
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
                  <span>{{@training.formattedDays}}</span>
                  <span>{{@training.formattedTime}}</span>
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

        <PixAccordions>
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
        <PixAccordions>
          <:title>
            <h2>{{t "pages.skill-review.recommended-engine.modal.program"}}</h2>
          </:title>
          <:content>
            <p class="results-recommendation-engine-training-card-modal__program">{{@training.program}}</p>
          </:content>
        </PixAccordions>
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
              />
              <PixIconButton
                @ariaLabel={{t "common.no"}}
                @iconName="dislike"
                @triggerAction={{fn this.submitFeedback false}}
                @size="small"
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
