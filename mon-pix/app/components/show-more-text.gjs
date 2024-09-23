import PixButton from '@1024pix/pix-ui/components/pix-button';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import onWindowResize from '../modifiers/on-window-resize';

export default class ShowMoreText extends Component {
  @tracked isOneLineText = false;
  @tracked isShrinked = true;

  @action
  toggleShrink() {
    this.isShrinked = !this.isShrinked;
  }

  handleTextContainerState = (element) => {
    this.isOneLineText = element.scrollWidth <= element.clientWidth;

    if (this.isOneLineText && !this.isShrinked) {
      this.isShrinked = true;
    }
  };

  <template>
    <div class="show-more-text" ...attributes>
      <div
        {{onWindowResize this.handleTextContainerState}}
        class="show-more-text__text-container
          {{if this.isOneLineText 'show-more-text__text-container--one-line'}}
          {{if this.isShrinked 'show-more-text__text-container--shrinked'}}"
      >
        {{yield}}
      </div>
      {{#unless this.isOneLineText}}
        <PixButton @triggerAction={{this.toggleShrink}} @variant="tertiary" @size="small">
          {{#if this.isShrinked}}
            {{t "common.actions.show-more"}}
          {{else}}
            {{t "common.actions.show-less"}}
          {{/if}}
        </PixButton>
      {{/unless}}
    </div>
  </template>
}
