import { metadata } from '@1024pix/epreuves-components/metadata';
import { PixButton, PixIcon, PixTag } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import htmlUnsafe from 'mon-pix/helpers/html-unsafe';
import didInsert from 'mon-pix/modifiers/modifier-did-insert';

import ModulixIssueReportBlock from '../issue-report/issue-report-block';
import ModuleElement from './module-element';

export default class ModulixCustomElement extends ModuleElement {
  @tracked
  customElement;

  @tracked reportInfo = { answer: null, elementId: this.args.component.id, elementType: this.args.component.type };

  @tracked
  resetButtonDisplayed = false;

  @service passageEvents;

  @action
  mountCustomElement(container) {
    this.customElement = document.createElement(this.args.component.tagName);

    const props = this.customElement.normalizeProps?.(this.args.component.props) ?? this.args.component.props;

    Object.assign(this.customElement, props);
    container.append(this.customElement);

    if (this.customElement.reset !== undefined) {
      this.resetButtonDisplayed = true;
    }
  }

  @action
  resetCustomElement() {
    this.customElement.reset();

    this.passageEvents.record({
      type: 'CUSTOM_RETRIED',
      data: {
        elementId: this.args.component.id,
      },
    });
  }

  get isInteractive() {
    if (metadata[this.args.component.tagName] !== undefined) {
      return metadata[this.args.component.tagName].isInteractive;
    } else {
      return true;
    }
  }

  get hasInstruction() {
    return this.args.component.instruction?.length > 0;
  }

  get hasTitle() {
    return this.args.component.title?.length > 0;
  }

  get hasFunctionalInstruction() {
    return this.args.component.functionalInstruction?.length > 0;
  }

  <template>
    <div class="element-custom">
      {{#if this.isInteractive}}
        <fieldset
          class="element-custom__container
            {{if this.resetButtonDisplayed 'element-custom--reset-interactive-state' ''}}"
        >
          {{#if this.hasTitle}}
            <PixTag @color="blue" class="element-custom-container__title">{{@component.title}}</PixTag>
          {{/if}}
          {{#if this.hasInstruction}}
            <div class="element-custom-container__instruction">
              {{htmlUnsafe @component.instruction}}
            </div>
          {{/if}}
          {{#if this.hasFunctionalInstruction}}
            <div class="element-custom-container__functional-instruction">
              {{htmlUnsafe @component.functionalInstruction}}
            </div>
          {{/if}}

          {{#if this.hasInstruction}}
            <legend class="sr-only">
              {{htmlUnsafe @component.instruction}}{{htmlUnsafe @component.functionalInstruction}}</legend>
          {{/if}}

          <legend class="element-custom__legend" aria-hidden="true">
            <PixIcon @name="leftClick" @plainIcon={{false}} @ariaHidden={{true}} />
            <span>{{t "pages.modulix.interactiveElement.label"}}</span>
          </legend>
          <div {{didInsert this.mountCustomElement}} />
        </fieldset>
      {{else}}
        {{#if this.hasInstruction}}
          <div class="element-custom__instruction">
            {{htmlUnsafe @component.instruction}}
          </div>
        {{/if}}

        <div
          class={{if this.resetButtonDisplayed "element-custom--reset-state"}}
          {{didInsert this.mountCustomElement}}
        />
      {{/if}}

      <div class={{if this.resetButtonDisplayed "element-custom__buttons" "element-custom__button"}}>
        <ModulixIssueReportBlock @reportInfo={{this.reportInfo}} />

        {{#if this.resetButtonDisplayed}}
          <PixButton
            class="element-custom-buttons__reset"
            @iconBefore="refresh"
            @variant="tertiary"
            @triggerAction={{this.resetCustomElement}}
            aria-label="{{t 'pages.modulix.buttons.interactive-element.reset.ariaLabel'}}"
          >{{t "pages.modulix.buttons.interactive-element.reset.name"}}</PixButton>
        {{/if}}
      </div>
    </div>
  </template>
}
