import { metadata } from '@1024pix/epreuves-components/metadata';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { action } from '@ember/object';
import { t } from 'ember-intl';
import didInsert from 'mon-pix/modifiers/modifier-did-insert';

import ModuleElement from './module-element';

export default class ModulixCustomElement extends ModuleElement {
  @action
  mountCustomElement(container) {
    const customElement = document.createElement(this.args.component.tagName);
    Object.assign(customElement, this.args.component.props);
    container.append(customElement);
  }

  get isInteractive() {
    if (metadata[this.args.component.tagName] !== undefined) {
      return metadata[this.args.component.tagName].isInteractive;
    } else {
      return true;
    }
  }

  <template>
    <div class="element-custom">
      {{#if this.isInteractive}}
        <fieldset class="element-custom__container">
          <legend class="element-custom__legend">
            <PixIcon @name="leftClick" @plainIcon={{false}} @ariaHidden={{true}} />
            <span>{{t "pages.modulix.interactiveElement.label"}}</span>
          </legend>
          <div class="element-custom__component" {{didInsert this.mountCustomElement}} />
        </fieldset>
      {{else}}
        <div class="element-custom__component" {{didInsert this.mountCustomElement}} />
      {{/if}}
    </div>
  </template>
}
