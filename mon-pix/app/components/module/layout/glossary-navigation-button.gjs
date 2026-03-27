import onEscapeAction from '@1024pix/pix-ui/addon/modifiers/on-escape-action';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import GlossaryModal from './glossary-modal';
import { tracked } from '@glimmer/tracking';

export default class ModulixGlossaryNavigationButton extends Component {
  @service modulixGlossaryModal;
  @service media;

  @tracked showModal = false;
  @tracked isTooltipVisible = false;

  @action openBookModal() {
    this.modulixGlossaryModal.openBookModal();
  }

  @action closeBookModal() {
    this.modulixGlossaryModal.closeBookModal();
  }

  @action
  showTooltip() {
    this.isTooltipVisible = true;
  }

  @action
  hideTooltip() {
    setTimeout(() => (this.isTooltipVisible = false));
  }

  @action
  hideTooltipOnMouseOut(event) {
    const isFocused = event.target.contains(document.activeElement);

    if (isFocused) {
      return;
    }

    this.hideTooltip(event);
  }

  <template>
    {{#if this.media.isMobile}}
      <button
        type="button"
        class="module-navigation-book-mobile-button"
        {{on "click" this.openBookModal}}
      >
        <img src="/images/modulix/glossary-book.png" alt="" />
        <span class="module-navigation-mobile-button__text">{{t "pages.modulix.navigation.buttons.book.label"}}</span>
      </button>
    {{else}}
      <div
        class="navigation-tooltip {{if this.isTooltipVisible 'navigation-tooltip--visible' ''}}"
        {{onEscapeAction this.hideTooltip}}
        {{on "mouseleave" this.hideTooltipOnMouseOut}}
        {{on "mouseenter" this.showTooltip}}
        {{on "focusin" this.showTooltip}}
        {{on "focusout" this.hideTooltip}}
      >
        <button
          type="button"
          class="module-navigation-book-button"
          {{on "click" this.openBookModal}}
        >
          <img src="/images/modulix/glossary-book.png" alt="" />
        </button>
        <span
          role="tooltip"
          class="navigation-tooltip__content navigation-tooltip__content--glossary"
          aria-hidden="true"
        >
          {{t "pages.modulix.navigation.buttons.book.label"}}
        </span>
      </div>
    {{/if}}

    <GlossaryModal
      @glossary={{@glossary}}
      @onCloseButtonClick={{this.closeBookModal}}
    />
  </template>
}
