import PixButton from '@1024pix/pix-ui/components/pix-button';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
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
  @service media;

  @tracked modalIsOpen = false;

  titleId = `results-recommendation-engine-training-card-content-title-${guidFor(this)}`;
  registrationCardTagId = `results-recommendation-engine-training-card-content-registration-card-tag-${guidFor(this)}`;

  get deliveryMode() {
    const deliveryMode = this.args.training.deliveryMode === 'onSite' ? 'on-site' : this.args.training.deliveryMode;

    return this.intl.t(`pages.skill-review.recommended-engine.training-card.delivery-mode.${deliveryMode}`);
  }

  get formattedDuration() {
    return Training.formatDuration({ locale: this.locale.currentLanguage, duration: this.args.training.duration });
  }

  get formattedExtendedDuration() {
    return Training.formatExtendedDuration({
      locale: this.locale.currentLanguage,
      duration: this.args.training.duration,
    });
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
  showHighlightedCardModal() {
    this.args.onHighlightedCardButtonClick({ trainingId: this.args.training.id });
    this.modalIsOpen = true;
  }

  @action
  closeModal() {
    this.modalIsOpen = false;
  }

  <template>
    {{#if @isHighlighted}}
      <div class="results-recommendation-engine-highlighted-training-card">
        <div class="results-recommendation-engine-highlighted-training-card-description">
          <RegistrationCardTag @registrationRequired={{@training.registrationRequired}} />
          <h4
            class="results-recommendation-engine-highlighted-training-card-description__title"
          >{{@training.title}}</h4>
          <ul class="results-recommendation-engine-highlighted-training-card-description__information">
            <li>{{this.type}}</li>
            <li>{{this.deliveryMode}}</li>
            {{#if @training.hasDuration}}
              <li aria-label={{this.formattedExtendedDuration}}>{{this.formattedDuration}}</li>
            {{/if}}
          </ul>
          <PixButton
            @triggerAction={{this.showHighlightedCardModal}}
            class="results-recommendation-engine-highlighted-training-card-description__button"
          >
            {{t "pages.skill-review.recommended-engine.highlighted-card.learn-more"}}
          </PixButton>
        </div>
        {{#unless this.media.isMobile}}
          <img
            class="results-recommendation-engine-highlighted-training-card-illustration"
            src="{{this.illustrationPath}}"
            alt=""
          />
        {{/unless}}
      </div>
    {{else}}
      <div class="results-recommendation-engine-training-card">
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
        <RegistrationCardTag
          id={{this.registrationCardTagId}}
          @registrationRequired={{@training.registrationRequired}}
        />
        <section class="results-recommendation-engine-training-card-content">
          <h4
            id={{this.titleId}}
            class="results-recommendation-engine-training-card-content__title"
          >{{@training.title}}</h4>
          <ul class="results-recommendation-engine-training-card-content__details"><li>{{this.type}}</li>
            <li>{{this.deliveryMode}}</li>
            {{#if @training.hasDuration}}
              <li aria-label={{this.formattedExtendedDuration}}>{{this.formattedDuration}}</li>
            {{/if}}
          </ul>
        </section>
        <button
          class="results-recommendation-engine-training-card__button"
          type="button"
          aria-label={{t "pages.skill-review.recommended-engine.training-card.aria-label"}}
          aria-describedby={{this.titleId}}
          disabled={{@disabled}}
          {{on "click" this.showModal}}
        ></button>
      </div>
    {{/if}}
    <CardModal
      @training={{@training}}
      @deliveryMode={{this.deliveryMode}}
      @isOpen={{this.modalIsOpen}}
      @onClose={{this.closeModal}}
      @onModalButtonClick={{@onModalButtonClick}}
      @onModalAccordionClick={{@onModalAccordionClick}}
    />
  </template>
}
