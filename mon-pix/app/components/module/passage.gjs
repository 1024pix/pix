import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { pageTitle } from 'ember-page-title';
import PixModal from '@1024pix/pix-ui/components/pix-modal';

import { inc } from '../../helpers/inc';
import didInsert from '../../modifiers/modifier-did-insert';
import ModuleGrain from './grain/grain';
import BetaBanner from './layout/beta-banner';
import ModuleSectionTitle from './section-title';

export default class ModulePassage extends Component {
  @service router;
  @service pixMetrics;
  @service store;
  @service modulixAutoScroll;
  @service passageEvents;
  @service featureToggles;
  @service modulixNavigationProgress;
  @service modulixIssueReportModal;

  get enrichedSections() {
    return this.args.module.sections.map((section, index) => {
      return {
        firstGrainId: section.grains[0].id,
        lastGrainId: section.grains[section.grains.length - 1].id,
        sectionId: section.id,
        sectionIndex: index,
        sectionType: section.type,
      };
    });
  }

  get issueReportModalDisplayed() {
    return this.modulixIssueReportModal.issueReportModalDisplayed;
  }

  get isNewPattern() {
    return this.args.module.isNewPattern;
  }

  @action
  getSectionTypeForGrain(grain) {
    return this.enrichedSections.find((section) => section.firstGrainId === grain.id).sectionType;
  }

  @action
  shouldDisplaySectionTitle(grain) {
    return this.enrichedSections.some(
      (section) => section.firstGrainId === grain.id && section.sectionType !== 'blank',
    );
  }

  @action
  shouldFocusAndScrollToGrain(grain) {
    return !this.shouldDisplaySectionTitle(grain);
  }

  get flatGrains() {
    return this.args.module.sections.flatMap((section) => section.grains);
  }

  displayableGrains = this.flatGrains.filter((grain) => ModuleGrain.getSupportedComponents(grain).length > 0);
  @tracked grainsToDisplay = this.displayableGrains.length > 0 ? [this.displayableGrains[0]] : [];

  @action
  hasGrainJustAppeared(index) {
    if (this.grainsToDisplay.length === 1) {
      return false;
    }

    return this.grainsToDisplay.length - 1 === index;
  }

  get hasNextGrain() {
    return this.grainsToDisplay.length < this.displayableGrains.length;
  }

  get currentGrainIndex() {
    return this.grainsToDisplay.length - 1;
  }

  @action
  onGrainSkip() {
    const currentGrain = this.displayableGrains[this.currentGrainIndex];
    this.modulixNavigationProgress.determineCurrentSection(this.enrichedSections, currentGrain);
    this.addNextGrainToDisplay();

    this.passageEvents.record({
      type: 'GRAIN_SKIPPED',
      data: {
        grainId: currentGrain.id,
      },
    });
  }

  @action
  onGrainContinue() {
    const currentGrain = this.displayableGrains[this.currentGrainIndex];

    this.modulixNavigationProgress.determineCurrentSection(this.enrichedSections, currentGrain);

    this.addNextGrainToDisplay();

    this.passageEvents.record({
      type: 'GRAIN_CONTINUED',
      data: {
        grainId: currentGrain.id,
      },
    });
  }

  @action
  onStepperNextStep(currentStepPosition) {
    const currentGrain = this.displayableGrains[this.currentGrainIndex];

    this.passageEvents.record({
      type: 'STEPPER_NEXT_STEP',
      data: {
        grainId: currentGrain.id,
        stepNumber: currentStepPosition,
      },
    });

    this.pixMetrics.trackEvent(`Clic sur le bouton suivant du stepper`, {
      category: 'Modulix',
      moduleId: this.args.module.id,
      grainId: currentGrain.id,
      step: currentStepPosition,
    });
  }

  addNextGrainToDisplay() {
    if (!this.hasNextGrain) {
      return;
    }

    const nextGrain = this.displayableGrains[this.currentGrainIndex + 1];
    this.grainsToDisplay = [...this.grainsToDisplay, nextGrain];
  }

  @action
  grainCanMoveToNextGrain(index) {
    return this.currentGrainIndex === index && this.hasNextGrain;
  }

  @action
  grainShouldDisplayTerminateButton(index) {
    return this.currentGrainIndex === index && !this.hasNextGrain;
  }

  @action
  async onModuleTerminate({ grainId }) {
    const adapter = this.store.adapterFor('passage');
    await adapter.terminate({ passageId: this.args.passage.id });
    this.pixMetrics.trackEvent(`Clic sur le bouton Terminer`, {
      category: 'Modulix',
      moduleId: this.args.module.id,
      grainId: grainId,
    });
    this.passageEvents.record({
      type: 'PASSAGE_TERMINATED',
    });
    return this.router.transitionTo('module.recap', this.args.module);
  }

  @action
  async onElementAnswer(answerData) {
    await this.store
      .createRecord('element-answer', {
        userResponse: answerData.userResponse,
        elementId: answerData.element.id,
        passage: this.args.passage,
      })
      .save({
        adapterOptions: { passageId: this.args.passage.id },
      });
  }

  @action
  async onElementRetry(answerData) {
    this.pixMetrics.trackEvent(`Clic sur le bouton réessayer`, {
      category: 'Modulix',
      moduleId: this.args.module.id,
      elementId: answerData.element.id,
    });
  }

  @action
  async onImageAlternativeTextOpen(imageElementId) {
    this.pixMetrics.trackEvent(`Clic sur le bouton alternative textuelle`, {
      category: 'Modulix',
      moduleId: this.args.module.id,
      elementId: imageElementId,
    });

    this.passageEvents.record({
      type: 'IMAGE_ALTERNATIVE_TEXT_OPENED',
      data: {
        elementId: imageElementId,
      },
    });
  }

  @action
  async onVideoTranscriptionOpen(videoElementId) {
    this.pixMetrics.trackEvent(`Clic sur le bouton transcription`, {
      category: 'Modulix',
      moduleId: this.args.module.id,
      elementId: videoElementId,
    });

    this.passageEvents.record({
      type: 'VIDEO_TRANSCRIPTION_OPENED',
      data: {
        elementId: videoElementId,
      },
    });
  }

  @action
  async onFileDownload({ elementId, format, filename }) {
    this.passageEvents.record({
      type: 'FILE_DOWNLOADED',
      data: {
        elementId,
        format,
        filename,
      },
    });
  }

  @action
  async onExpandToggle({ elementId, isOpen }) {
    const eventToggle = isOpen ? 'Ouverture' : 'Fermeture';
    this.pixMetrics.trackEvent(`${eventToggle} de l'élément Expand`, {
      category: 'Modulix',
      moduleId: this.args.module.id,
      elementId: elementId,
    });

    this.passageEvents.record({
      type: isOpen ? 'EXPAND_OPENED' : 'EXPAND_CLOSED',
      data: {
        elementId,
      },
    });
  }

  get sectionsLength() {
    return this.args.module.sections.length;
  }

  get currentStep() {
    return this.modulixNavigationProgress.currentSectionIndex + 1;
  }

  <template>
    {{pageTitle @module.title}}

    <main class="module-passage {{if this.isNewPattern 'module-passage--new-pattern'}}">
      {{#if @module.isBeta}}
        <BetaBanner />
      {{/if}}

      <div class="module-passage__title">
        <h1>{{@module.title}}</h1>
      </div>

      <div
        class="module-passage__content"
        aria-live="assertive"
        {{didInsert this.modulixAutoScroll.setHTMLElementScrollOffsetCssProperty}}
      >
        {{#each this.grainsToDisplay as |grain index|}}
          {{#if (this.shouldDisplaySectionTitle grain)}}
            <ModuleSectionTitle @sectionType={{this.getSectionTypeForGrain grain}} />
            <h3 class="screen-reader-only">
              {{t
                "pages.modulix.flashcards.navigation.longCurrentStep"
                current=this.currentStep
                total=this.sectionsLength
              }}
            </h3>
          {{/if}}
          <ModuleGrain
            @grain={{grain}}
            @shouldFocusAndScroll={{this.shouldFocusAndScrollToGrain grain}}
            @currentStep={{inc index}}
            @totalSteps={{this.displayableGrains.length}}
            @onElementRetry={{this.onElementRetry}}
            @passage={{@passage}}
            @onImageAlternativeTextOpen={{this.onImageAlternativeTextOpen}}
            @onVideoTranscriptionOpen={{this.onVideoTranscriptionOpen}}
            @onElementAnswer={{this.onElementAnswer}}
            @onStepperNextStep={{this.onStepperNextStep}}
            @canMoveToNextGrain={{this.grainCanMoveToNextGrain index}}
            @onGrainContinue={{this.onGrainContinue}}
            @onGrainSkip={{this.onGrainSkip}}
            @shouldDisplayTerminateButton={{this.grainShouldDisplayTerminateButton index}}
            @hasJustAppeared={{this.hasGrainJustAppeared index}}
            @onModuleTerminate={{this.onModuleTerminate}}
            @onFileDownload={{this.onFileDownload}}
            @onExpandToggle={{this.onExpandToggle}}
          />
        {{/each}}
      </div>
      <PixModal
          @title="test"
          @showModal={{this.issueReportModalDisplayed}}>
        <:content>
          <p>PO OUF</p>
        </:content>
      </PixModal>
    </main>
  </template>
}
