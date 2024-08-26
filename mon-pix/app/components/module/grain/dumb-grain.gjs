import PixButton from '@1024pix/pix-ui/components/pix-button';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';
import Element from 'mon-pix/components/module/element';
import GrainTag from 'mon-pix/components/module/grain/tag';
import Stepper from 'mon-pix/components/module/stepper';
import htmlUnsafe from 'mon-pix/helpers/html-unsafe';

export default class DumbGrain extends Component {
  static AVAILABLE_GRAIN_TYPES = ['lesson', 'activity'];
  static AVAILABLE_ELEMENT_TYPES = ['text', 'image', 'video', 'download', 'embed', 'qcu', 'qcm', 'qrocm'];

  get grainType() {
    if (DumbGrain.AVAILABLE_GRAIN_TYPES.includes(this.args.grain.type)) {
      return this.args.grain.type;
    } else {
      return 'lesson';
    }
  }
  static getSupportedComponents(grain) {
    return grain.components
      .map((component) => {
        switch (component.type) {
          case 'element':
            return DumbGrain.getSupportedComponentElement(component);
          case 'stepper':
            return DumbGrain.getSupportedComponentStepper(component);
          default:
            return undefined;
        }
      })
      .filter((component) => {
        return component !== undefined;
      });
  }
  static getSupportedComponentElement(component) {
    if (DumbGrain.AVAILABLE_ELEMENT_TYPES.includes(component.element.type)) {
      return component;
    } else {
      return undefined;
    }
  }
  get displayableComponents() {
    return DumbGrain.getSupportedComponents(this.args.grain);
  }

  static getSupportedComponentStepper(component) {
    const steps = [];
    for (const step of component.steps) {
      const elements = step.elements.filter((element) => DumbGrain.AVAILABLE_ELEMENT_TYPES.includes(element.type));
      if (elements.length > 0) {
        steps.push({ ...step, elements });
      }
    }

    return steps.length > 0 ? { ...component, steps } : undefined;
  }
  static getSupportedElements(grain) {
    return grain.components
      .flatMap((component) => {
        switch (component.type) {
          case 'element':
            return component.element;
          case 'stepper':
            return component.steps.flatMap(({ elements }) => elements);
          default:
            return undefined;
        }
      })
      .filter((element) => {
        return element !== undefined && DumbGrain.AVAILABLE_ELEMENT_TYPES.includes(element.type);
      });
  }

  <template>
    <article class="grain {{if @hasJustAppeared 'grain--active'}}" tabindex="-1">
      <h2 class="screen-reader-only">{{@grain.title}}</h2>

      {{#if @transition}}
        <header class="grain__header">
          {{htmlUnsafe @transition.content}}
        </header>
      {{/if}}

      <div class="grain-card__tag">
        <GrainTag @type={{this.grainType}} />
      </div>
      <div class="grain__card grain-card--{{this.grainType}}">
        <div class="grain-card__content">
          <!-- eslint-disable-next-line no-unused-vars -->
          {{#each this.displayableComponents as |component|}}
            {{#if (eq component.type "element")}}
              <div class="grain-card-content__element">
                <Element
                  @element={{component.element}}
                  @onImageAlternativeTextOpen={{@onImageAlternativeTextOpen}}
                  @onVideoTranscriptionOpen={{@onVideoTranscriptionOpen}}
                  @onElementAnswer={{@onElementAnswer}}
                  @onElementRetry={{@onElementRetry}}
                  @onVideoPlay={{@onVideoPlay}}
                  @getLastCorrectionForElement={{@getLastCorrectionForElement}}
                  @onFileDownload={{@onFileDownload}}
                />
              </div>
            {{else if (eq component.type "stepper")}}
              <div class="grain-card-content__stepper">
                <Stepper
                  @steps={{component.steps}}
                  @onElementAnswer={{@onElementAnswer}}
                  @onElementRetry={{@onElementRetry}}
                  @passage={{@passage}}
                  @getLastCorrectionForElement={{@getLastCorrectionForElement}}
                  @stepperIsFinished={{@stepperIsFinished}}
                  @onStepperNextStep={{@onStepperNextStep}}
                  @onImageAlternativeTextOpen={{@onImageAlternativeTextOpen}}
                  @onVideoTranscriptionOpen={{@onVideoTranscriptionOpen}}
                  @onVideoPlay={{@onVideoPlay}}
                  @onFileDownload={{@onFileDownload}}
                  @isFolded={{@shouldFoldStepper}}
                />
              </div>
            {{/if}}
          {{/each}}
        </div>

        {{#if @shouldDisplaySkipButton}}
          <footer class="grain-card__footer">
            <PixButton @variant="tertiary" @triggerAction={{@onGrainSkip}}>
              {{t "pages.modulix.buttons.grain.skip"}}
            </PixButton>
          </footer>
        {{/if}}

        {{#if @shouldDisplayContinueButton}}
          <footer class="grain-card__footer">
            <PixButton @variant="primary" @triggerAction={{@onGrainContinue}}>
              {{t "pages.modulix.buttons.grain.continue"}}
            </PixButton>
          </footer>
        {{/if}}

        {{#if @shouldDisplayTerminateButton}}
          <footer class="grain-card__footer">
            <PixButton @variant="primary" @triggerAction={{@onModuleTerminate}}>
              {{t "pages.modulix.buttons.grain.terminate"}}
            </PixButton>
          </footer>
        {{/if}}
      </div>
    </article>
  </template>
}
