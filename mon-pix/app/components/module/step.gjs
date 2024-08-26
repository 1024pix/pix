import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import Element from 'mon-pix/components/module/element';
import DumbGrain from 'mon-pix/components/module/grain/dumb-grain';

import didInsert from '../../modifiers/modifier-did-insert';

export default class ModulixStep extends Component {
  @service modulixAutoScroll;

  get displayableElements() {
    return this.args.step.elements.filter((element) => DumbGrain.AVAILABLE_ELEMENT_TYPES.includes(element.type));
  }

  get hasDisplayableElements() {
    return this.displayableElements.length > 0;
  }

  @action
  focusAndScroll(htmlElement) {
    if (!this.args.hasJustAppeared) {
      return;
    }

    this.modulixAutoScroll.focusAndScroll(htmlElement);
  }

  <template>
    {{#if this.hasDisplayableElements}}
      <section class="stepper__step" tabindex="-1" {{didInsert this.focusAndScroll}}>
        <h3
          class="stepper-step__position"
          aria-label="{{t 'pages.modulix.stepper.step.position' currentStep=@currentStep totalSteps=@totalSteps}}"
        >
          <span class="stepper-step-position__content">{{@currentStep}}/{{@totalSteps}}</span>
        </h3>
        {{#each this.displayableElements as |element|}}
          <div class="grain-card-content__element">
            <Element
              @element={{element}}
              @onElementAnswer={{@onElementAnswer}}
              @onElementRetry={{@onElementRetry}}
              @getLastCorrectionForElement={{@getLastCorrectionForElement}}
              @onImageAlternativeTextOpen={{@onImageAlternativeTextOpen}}
              @onVideoTranscriptionOpen={{@onVideoTranscriptionOpen}}
              @onVideoPlay={{@onVideoPlay}}
              @onFileDownload={{@onFileDownload}}
            />
          </div>
        {{/each}}
      </section>
    {{/if}}
  </template>
}
