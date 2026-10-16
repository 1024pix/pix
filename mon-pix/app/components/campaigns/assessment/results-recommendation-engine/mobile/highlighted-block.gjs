import { PixButton } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { modifier } from 'ember-modifier';

import MarkdownToHtml from '../../../../markdown-to-html';
import CardModal from '../training/card-modal';
import { getTrainingInfo } from './training-info';

export default class MobileHighlightedBlock extends Component {
  @service intl;
  @service locale;

  @tracked isTextExpanded = false;
  @tracked modalIsOpen = false;
  @tracked isTextOverflowing = false;

  detectTextOverflow = modifier((element) => {
    const frame = requestAnimationFrame(() => {
      this.isTextOverflowing = element.scrollHeight > element.clientHeight;
    });
    return () => cancelAnimationFrame(frame);
  });

  get shouldDisplayToggleButton() {
    return this.isTextExpanded || this.isTextOverflowing;
  }

  get info() {
    return getTrainingInfo({ training: this.args.training, intl: this.intl, locale: this.locale });
  }

  @action toggleText() {
    this.isTextExpanded = !this.isTextExpanded;
  }

  @action openModal() {
    this.args.onHighlightedCardButtonClick({ trainingId: this.args.training.id });
    this.modalIsOpen = true;
  }

  @action closeModal() {
    this.modalIsOpen = false;
  }

  <template>
    <section class="reco-mobile-highlighted">
      <h2 class="reco-mobile-highlighted__title">
        {{t "pages.skill-review.recommended-engine.mobile.highlighted-block.title"}}
      </h2>
      <p
        class="reco-mobile-highlighted__text {{unless this.isTextExpanded 'reco-mobile-highlighted__text--clamped'}}"
        {{this.detectTextOverflow}}
      >
        <MarkdownToHtml @isInline={{true}} @markdown={{@campaignParticipationResult.reachedStage.message}} />
      </p>
      {{#if this.shouldDisplayToggleButton}}
        <button
          type="button"
          class="reco-mobile-link"
          aria-expanded={{if this.isTextExpanded "true" "false"}}
          {{on "click" this.toggleText}}
        >
          {{if this.isTextExpanded (t "common.actions.show-less") (t "common.actions.show-more")}}
        </button>
      {{/if}}

      <div class="reco-mobile-highlighted__card-wrapper">
        <p class="reco-mobile-highlighted__tag">
          <span aria-hidden="true">🔥</span>
          {{t "pages.skill-review.recommended-engine.mobile.highlighted-block.tag" htmlSafe=true}}
        </p>
        <div class="reco-mobile-highlighted__card">
          <h3 class="reco-mobile-highlighted__card-title">{{@training.title}}</h3>
          <p class="reco-mobile-highlighted__card-info">
            {{this.info.type}}
            •
            {{this.info.deliveryMode}}
            {{#if this.info.duration}}• {{this.info.duration}}{{/if}}
          </p>
          <PixButton
            class="reco-mobile-highlighted__card-button"
            @variant="secondary"
            @triggerAction={{this.openModal}}
          >
            {{t "pages.skill-review.recommended-engine.highlighted-card.learn-more"}}
          </PixButton>
        </div>
      </div>
    </section>

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
