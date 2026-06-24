import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import Training from 'mon-pix/models/training';

import CardModal from './card-modal';
import RegistrationCardTag from './registration-card-tag';

export default class Card extends Component {
  @service intl;
  @service locale;

  @tracked modalIsOpen = false;

  get deliveryMode() {
    const deliveryMode = this.args.training.deliveryMode === 'onSite' ? 'on-site' : this.args.training.deliveryMode;

    return this.intl.t(`pages.skill-review.recommended-engine.training-card.delivery-mode.${deliveryMode}`);
  }

  get formattedDuration() {
    return Training.formatDuration({ locale: this.locale.currentLanguage, duration: this.args.training.duration });
  }

  get illustrationPath() {
    return `/images/illustrations/results/training-${this.args.training.type}.webp`;
  }

  get type() {
    if (this.args.training.isTypeLinkedToALocation) {
      return this.intl.t('pages.training.type.formation');
    }
    return this.intl.t(`pages.training.type.${this.args.training.type}`);
  }

  @action
  showModal() {
    this.args.onCardClick({ trainingId: this.args.training.id });
    this.modalIsOpen = true;
  }

  @action
  closeModal() {
    this.modalIsOpen = false;
  }

  <template>
    <button
      class="results-recommendation-engine-training-card"
      type="button"
      aria-label={{t "pages.skill-review.recommended-engine.training-card.aria-label"}}
      {{on "click" this.showModal}}
    >
      <div class="results-recommendation-engine-training-card-image-hero">
        <img
          class="results-recommendation-engine-training-card-image-hero__editor-logo"
          src="{{@training.editorLogoUrl}}"
          alt=""
        />
        <img
          class="results-recommendation-engine-training-card-image-hero__illustration"
          src="{{this.illustrationPath}}"
          alt=""
        />
      </div>
      <RegistrationCardTag @registrationRequired={{@training.registrationRequired}} />
      <section class="results-recommendation-engine-training-card-content">
        <p class="results-recommendation-engine-training-card-content__title">{{@training.title}}</p>
        <ul class="results-recommendation-engine-training-card-content__details"><li>{{this.type}}</li>
          <li>{{this.deliveryMode}}</li>
          {{#if @training.hasDuration}}
            <li>{{this.formattedDuration}}</li>
          {{/if}}
        </ul>
      </section>
    </button>
    <CardModal
      @training={{@training}}
      @deliveryMode={{this.deliveryMode}}
      @formattedDays={{@training.formattedDays}}
      @formattedTime={{@training.formattedTime}}
      @isOpen={{this.modalIsOpen}}
      @onClose={{this.closeModal}}
      @onModalButtonClick={{@onModalButtonClick}}
      @onModalAccordionClick={{@onModalAccordionClick}}
    />
  </template>
}
