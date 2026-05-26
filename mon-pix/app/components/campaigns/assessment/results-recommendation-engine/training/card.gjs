import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

export default class Card extends Component {
  @service intl;

  @tracked modalIsOpen = false;

  get tagProperties() {
    const registrationRequired = this.args.training.registrationRequired;

    const color = registrationRequired ? 'blue-light' : 'purple';
    const iconName = registrationRequired ? 'lock' : 'acute';
    const translationKey = registrationRequired ? 'yes' : 'no';
    const text = this.intl.t(
      `pages.skill-review.recommended-engine.training-card.registration-required.${translationKey}`,
    );

    return {
      color,
      iconName,
      text,
    };
  }

  get deliveryMode() {
    const deliveryMode = this.args.training.deliveryMode === 'onSite' ? 'on-site' : this.args.training.deliveryMode;

    return this.intl.t(`pages.skill-review.recommended-engine.training-card.delivery-mode.${deliveryMode}`);
  }

  get type() {
    if (this.args.training.isTypeLinkedToALocation) {
      return this.intl.t('pages.training.type.formation');
    }
    return this.intl.t(`pages.training.type.${this.args.training.type}`);
  }

  @action
  showModal() {
    this.modalIsOpen = true;
  }

  @action
  closeModal() {
    this.modalIsOpen = false;
  }

  <template>
    <button class="results-recommendation-engine-training-card" type="button" {{on "click" this.showModal}}>
      <div class="results-recommendation-engine-training-card-image-hero">
        <img
          class="results-recommendation-engine-training-card-image-hero__editor-logo"
          src="{{@training.editorLogoUrl}}"
          alt=""
        />
      </div>
      <PixTag @color={{this.tagProperties.color}} class="results-recommendation-engine-training-card__tag">
        <PixIcon
          class="results-recommendation-engine-training-card__tag-icon"
          @name={{this.tagProperties.iconName}}
          @ariaHidden={{true}}
        />
        {{this.tagProperties.text}}
      </PixTag>
      <section class="results-recommendation-engine-training-card-content">
        <p class="results-recommendation-engine-training-card-content__title">{{@training.title}}</p>
        <ul class="results-recommendation-engine-training-card-content__details"><li>{{this.type}}</li>
          <li>{{this.deliveryMode}}</li>
          {{#if @training.hasDuration}}
            <li>{{@training.formattedDuration}}</li>
          {{/if}}
        </ul>
      </section>
    </button>
    <PixModal
      @title={{@training.title}}
      @showModal={{this.modalIsOpen}}
      @onCloseButtonClick={{this.closeModal}}
      class="results-recommendation-engine-training-card-modal"
    >
      <:content>
        <section class="results-recommendation-engine-training-card-modal__section">
          <div class="results-recommendation-engine-training-card-modal-section__description">
            <PixTag @color={{this.tagProperties.color}} class="results-recommendation-engine-training-card__tag">
              <PixIcon
                class="results-recommendation-engine-training-card__tag-icon"
                @name={{this.tagProperties.iconName}}
                @ariaHidden={{true}}
              />
              {{this.tagProperties.text}}
            </PixTag>
            <p>{{t "pages.skill-review.recommended-engine.modal.editor-name"}}<span>{{@training.editorName}}</span></p>
            <p>{{@training.description}}</p>
          </div>
          <div class="results-recommendation-engine-training-card-modal-section__information">
            {{#if @training.hasDuration}}
              <div class="results-recommendation-engine-training-card-modal-section__time-information">
                <PixIcon @name="time" @ariaHidden={{true}} />
                <p>{{t "pages.skill-review.recommended-engine.modal.duration"}}</p>
                <p class="results-recommendation-engine-training-card-modal-section__time-information--bold">
                  <span>{{this.formattedDays}}</span>
                  <span>{{this.formattedTime}}</span>
                </p>
              </div>
            {{/if}}
            <div class="results-recommendation-engine-training-card-modal-section__localisation-information">
              <PixIcon @name="mapPin" @ariaHidden={{true}} />
              <p>{{t "pages.skill-review.recommended-engine.modal.localisation"}}</p>
              <p
                class="results-recommendation-engine-training-card-modal-section__localisation-information--bold"
              >{{this.deliveryMode}}</p>
            </div>
          </div>
        </section>
      </:content>
      <:footer>
      </:footer>
    </PixModal>
  </template>
}
