import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { cancelTask, runTask } from 'ember-lifeline';
import { modifier } from 'ember-modifier';
import htmlUnsafe from 'mon-pix/helpers/html-unsafe';
import didInsert from 'mon-pix/modifiers/modifier-did-insert';

import floatingPosition from '../../../modifiers/floating-position';

const HIDE_DELAY_IN_MS = 150;

export default class ModulixGlossaryTerm extends Component {
  @service modulixGlossary;

  @tracked anchorElement;
  @tracked isPinned = false;
  tooltipId = `glossary-tooltip-${guidFor(this)}`;
  hideTimer;

  get definition() {
    return this.modulixGlossary.getDefinition(this.args.word);
  }

  get isOpen() {
    return this.modulixGlossary.isOpened(this.tooltipId);
  }

  get tooltipContainer() {
    return document.body;
  }

  closeOnOutsideInteraction = modifier((tooltipElement) => {
    const closeIfOutside = (event) => {
      if (!this.anchorElement.contains(event.target) && !tooltipElement.contains(event.target)) {
        this.close();
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        this.close();
      }
    };

    document.addEventListener('pointerdown', closeIfOutside);
    document.addEventListener('focusin', closeIfOutside);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('pointerdown', closeIfOutside);
      document.removeEventListener('focusin', closeIfOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  });

  willDestroy() {
    super.willDestroy(...arguments);
    this.modulixGlossary.close(this.tooltipId);
  }

  #cancelScheduledClose() {
    if (!this.hideTimer) return;
    cancelTask(this, this.hideTimer);
    this.hideTimer = undefined;
  }

  @action
  registerAnchor(element) {
    this.anchorElement = element;
  }

  @action
  open() {
    this.#cancelScheduledClose();
    this.modulixGlossary.open(this.tooltipId);
  }

  @action
  close() {
    this.#cancelScheduledClose();
    this.isPinned = false;
    this.modulixGlossary.close(this.tooltipId);
  }

  @action
  onPointerEnter(event) {
    if (event.pointerType !== 'mouse') return;
    this.open();
  }

  @action
  onPointerLeave(event) {
    if (event.pointerType !== 'mouse' || this.isPinned) return;
    this.hideTimer = runTask(this, this.close, HIDE_DELAY_IN_MS);
  }

  @action
  onBlur() {
    if (this.isPinned) return;
    this.close();
  }

  @action
  togglePinned() {
    if (this.isPinned) {
      this.close();
      return;
    }
    this.isPinned = true;
    this.open();
  }

  <template>
    <button
      type="button"
      class="module-glossary-term"
      aria-expanded={{if this.isOpen "true" "false"}}
      aria-describedby={{if this.isOpen this.tooltipId}}
      {{didInsert this.registerAnchor}}
      {{on "pointerenter" this.onPointerEnter}}
      {{on "pointerleave" this.onPointerLeave}}
      {{on "focus" this.open}}
      {{on "blur" this.onBlur}}
      {{on "click" this.togglePinned}}
    >{{@text}}</button>

    {{#if this.isOpen}}
      {{#in-element this.tooltipContainer insertBefore=null}}
        <div
          id={{this.tooltipId}}
          role="tooltip"
          class="module-glossary-tooltip"
          {{floatingPosition this.anchorElement placement="top"}}
          {{this.closeOnOutsideInteraction}}
          {{on "pointerenter" this.onPointerEnter}}
          {{on "pointerleave" this.onPointerLeave}}
        >{{htmlUnsafe this.definition}}</div>
      {{/in-element}}
    {{/if}}
  </template>
}
