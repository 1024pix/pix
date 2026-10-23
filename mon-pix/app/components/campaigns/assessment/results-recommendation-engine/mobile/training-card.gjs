import { PixIcon } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import CardModal from '../training/card-modal';
import { getTrainingInfo } from './training-info';

export default class MobileTrainingCard extends Component {
  @service intl;
  @service locale;

  @tracked modalIsOpen = false;

  get info() {
    return getTrainingInfo({ training: this.args.training, intl: this.intl, locale: this.locale });
  }

  @action openModal() {
    this.args.onCardClick({ trainingId: this.args.training.id });
    this.modalIsOpen = true;
  }

  @action closeModal() {
    this.modalIsOpen = false;
  }

  <template>
    <article class="reco-mobile-training-card">
      <div class="reco-mobile-training-card__illustration">
        <img src={{this.info.illustrationPath}} alt="" />
      </div>
      <div class="reco-mobile-training-card__content">
        {{#if @training.editorLogoUrl}}
          <img
            class="reco-mobile-training-card__editor-logo"
            src={{@training.editorLogoUrl}}
            alt={{@training.editorName}}
          />
        {{/if}}
        <p class="reco-mobile-training-card__info">
          {{this.info.type}}
          •
          {{this.info.deliveryMode}}
          {{#if this.info.duration}}• {{this.info.duration}}{{/if}}
        </p>
        <h3 class="reco-mobile-training-card__title">{{@training.title}}</h3>
        <button type="button" class="reco-mobile-link reco-mobile-training-card__link" {{on "click" this.openModal}}>
          {{t "pages.skill-review.recommended-engine.mobile.trainings.learn-more"}}
          <span class="sr-only">: {{@training.title}}</span>
          <PixIcon @name="arrowRight" @ariaHidden={{true}} />
        </button>
      </div>
    </article>

    <CardModal
      @training={{@training}}
      @deliveryMode={{this.info.deliveryMode}}
      @isOpen={{this.modalIsOpen}}
      @onClose={{this.closeModal}}
      @onModalButtonClick={{@onModalButtonClick}}
      @onModalAccordionClick={{@onModalAccordionClick}}
    />
  </template>
}
