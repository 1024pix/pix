import PixButton from '@1024pix/pix-ui/components/pix-button';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import didRender from '../../../modifiers/did-render';

export default class EmbeddedSimulator extends Component {
  @action
  setIframeHtmlElement(htmlElement) {
    this.iframe = htmlElement;

    this.iframe.style.height = this.args.computedEmbedHeight;

    if (this.args.isGDevelop) {
      this.iframe.style.aspectRatio = '860/680';
    }
  }

  @action
  rebootSimulator() {
    const iframe = this.iframe;
    const tmpSrc = iframe.src;

    const loadListener = () => {
      if (iframe.src === 'about:blank') {
        // First onload: when we reset the iframe
        iframe.src = tmpSrc;
      } else {
        // Second onload: when we re-assign the iframe's src to its original value
        iframe.focus();
        iframe.removeEventListener('load', loadListener);
      }
    };

    iframe.addEventListener('load', loadListener);

    iframe.src = 'about:blank';
  }

  <template>
    {{! template-lint-disable style-concatenation no-inline-styles }}
    <div class="challenge-embed-simulator">
      {{#if @hideSimulator}}
        <div class="challenge-embed-simulator__overlay"></div>
      {{/if}}
      <iframe
        tabindex={{if @hideSimulator "-1"}}
        class="challenge-embed-simulator__iframe"
        src="{{@url}}"
        title="{{@title}}"
        allowfullscreen="true"
        webkitallowfullscreen="true"
        mozallowfullscreen="true"
        {{didRender this.setIframeHtmlElement}}
      >
      </iframe>
      {{#if @shouldDisplayRebootButton}}
        <div class="reboot-container">
          <PixButton
            class="link link--grey reboot-container__content"
            aria-label={{t "pages.challenge.embed-simulator.actions.reset-label"}}
            @iconBefore="refresh"
            @variant="tertiary"
            @triggerAction={{this.rebootSimulator}}
          >
            {{t "components.challenge.embed-simulator.actions.reset"}}
          </PixButton>
        </div>
      {{/if}}
    </div>
  </template>
}
