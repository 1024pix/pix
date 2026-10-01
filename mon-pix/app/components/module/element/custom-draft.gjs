import { PixButton, PixIcon } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import { htmlUnsafe } from '../../../helpers/html-unsafe';
import didInsert from '../../../modifiers/modifier-did-insert';
import ModulixIssueReportBlock from '../issue-report/issue-report-block';
import ModuleElement from './module-element';

export default class ModulixCustomDraft extends ModuleElement {
  @tracked reportInfo = {};

  @service passageEvents;

  constructor(...args) {
    super(...args);

    this.reportInfo = {
      answer: null,
      elementId: this.args.customDraft.id,
      elementType: this.args.customDraft.type,
    };
  }

  get heightStyle() {
    return htmlUnsafe(`height: ${this.args.customDraft.height}px`);
  }

  @action
  setIframeHtmlElement(htmlElement) {
    this.iframe = htmlElement;
  }

  @action
  resetEmbed() {
    this.passageEvents.record({
      type: 'CUSTOM_DRAFT_RETRIED',
      data: { elementId: this.args.customDraft.id },
    });

    this.iframe.setAttribute('src', this.args.customDraft.url);
    this.iframe.focus();
  }

  <template>
    <div class="element-custom-draft element-custom">
      {{#if @customDraft.instruction}}
        <div class="element-custom-draft__instruction">
          {{htmlUnsafe @customDraft.instruction}}
        </div>
      {{/if}}

      <fieldset class="element-custom-draft__container">
        <legend class="element-custom__legend">
          <PixIcon @name="leftClick" @plainIcon={{false}} @ariaHidden={{true}} />
          <span>{{t "pages.modulix.interactiveElement.label"}}</span>
        </legend>

        <iframe
          class="element-custom-draft__iframe"
          src={{@customDraft.url}}
          title={{@customDraft.title}}
          style={{this.heightStyle}}
          {{didInsert this.setIframeHtmlElement}}
        ></iframe>
      </fieldset>

      <div class="element-custom-draft__buttons">
        <ModulixIssueReportBlock @reportInfo={{this.reportInfo}} />

        <PixButton
          class="element-custom-draft-buttons__reset"
          @iconBefore="refresh"
          @variant="tertiary"
          @triggerAction={{this.resetEmbed}}
          aria-label="{{t 'pages.modulix.buttons.interactive-element.reset.ariaLabel'}}"
        >{{t "pages.modulix.buttons.interactive-element.reset.name"}}</PixButton>
      </div>
    </div>
  </template>
}
