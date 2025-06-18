import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { pageTitle } from 'ember-page-title';

import { inc } from '../../helpers/inc';
import didInsert from '../../modifiers/modifier-did-insert';
import ModuleGrain from './grain/grain';
import BetaBanner from './layout/beta-banner';
import ModuleNavbar from './layout/navbar';

export default class ModulePassage extends Component {
  @service router;
  @service metrics;
  @service store;
  @service modulixAutoScroll;
  @service passageEvents;

  displayableGrains = this.args.module.grains.filter((grain) => ModuleGrain.getSupportedComponents(grain).length > 0);
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

  get currentPassageStep() {
    return this.currentGrainIndex + 1;
  }

  @action
  onGrainSkip() {
    const currentGrain = this.displayableGrains[this.currentGrainIndex];

    this.addNextGrainToDisplay();

    this.metrics.trackEvent({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Passage du module : ${this.args.module.slug}`,
      'pix-event-name': `Click sur le bouton passer du grain : ${currentGrain.id}`,
    });
  }

  @action
  onGrainContinue() {
    const currentGrain = this.displayableGrains[this.currentGrainIndex];

    this.addNextGrainToDisplay();

    this.metrics.trackEvent({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Passage du module : ${this.args.module.slug}`,
      'pix-event-name': `Click sur le bouton continuer du grain : ${currentGrain.id}`,
    });
  }

  @action
  onStepperNextStep(currentStepPosition) {
    const currentGrain = this.displayableGrains[this.currentGrainIndex];

    this.metrics.trackEvent({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Passage du module : ${this.args.module.slug}`,
      'pix-event-name': `Click sur le bouton suivant de l'étape ${currentStepPosition} du stepper dans le grain : ${currentGrain.id}`,
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
    this.metrics.trackEvent({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Passage du module : ${this.args.module.slug}`,
      'pix-event-name': `Click sur le bouton Terminer du grain : ${grainId}`,
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

    this.metrics.trackEvent({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Passage du module : ${this.args.module.slug}`,
      'pix-event-name': `Click sur le bouton vérifier de l'élément : ${answerData.element.id}`,
    });
  }

  @action
  async onSelfAssessment({ userAssessment, cardId }) {
    this.metrics.trackEvent({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Passage du module : ${this.args.module.slug}`,
      'pix-event-name': `Click sur le bouton '${userAssessment}' de la flashcard : ${cardId}`,
    });
  }

  @action
  async onElementRetry(answerData) {
    this.metrics.trackEvent({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Passage du module : ${this.args.module.slug}`,
      'pix-event-name': `Click sur le bouton réessayer de l'élément : ${answerData.element.id}`,
    });
  }

  @action
  async onImageAlternativeTextOpen(imageElementId) {
    this.metrics.trackEvent({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Passage du module : ${this.args.module.slug}`,
      'pix-event-name': `Click sur le bouton alternative textuelle : ${imageElementId}`,
    });
  }

  @action
  async onVideoTranscriptionOpen(videoElementId) {
    this.metrics.trackEvent({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Passage du module : ${this.args.module.slug}`,
      'pix-event-name': `Click sur le bouton transcription : ${videoElementId}`,
    });
  }

  @action
  async onVideoPlay({ elementId }) {
    this.metrics.trackEvent({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Passage du module : ${this.args.module.slug}`,
      'pix-event-name': `Click sur le bouton Play : ${elementId}`,
    });
  }

  @action
  async onFileDownload({ elementId, downloadedFormat }) {
    this.metrics.trackEvent({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Passage du module : ${this.args.module.slug}`,
      'pix-event-name': `Click sur le bouton Télécharger au format ${downloadedFormat} de ${elementId}`,
    });
  }

  @action
  async goToGrain(grainId) {
    const element = document.getElementById(`grain_${grainId}`);
    this.modulixAutoScroll.focusAndScroll(element);

    this.metrics.trackEvent({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Passage du module : ${this.args.module.slug}`,
      'pix-event-name': `Click sur le grain ${grainId} de la barre de navigation`,
    });
  }

  @action
  async onExpandToggle({ elementId, isOpen }) {
    const eventToggle = isOpen ? 'Ouverture' : 'Fermeture';
    this.metrics.trackEvent({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Passage du module : ${this.args.module.slug}`,
      'pix-event-name': `${eventToggle} de l'élément Expand : ${elementId}`,
    });
  }

  <template>
    {{pageTitle @module.title}}
    {{#if @module.isBeta}}
      <BetaBanner />
    {{/if}}
    <ModuleNavbar
      @currentStep={{this.currentPassageStep}}
      @totalSteps={{this.displayableGrains.length}}
      @module={{@module}}
    />

    <main class="module-passage">
      <div class="module-passage__title">
        <h1>{{@module.title}}</h1>
      </div>

      <div
        class="module-passage__content"
        aria-live="assertive"
        {{didInsert this.modulixAutoScroll.setHTMLElementScrollOffsetCssProperty}}
      >
        {{#each this.grainsToDisplay as |grain index|}}
          <ModuleGrain
            @grain={{grain}}
            @currentStep={{inc index}}
            @totalSteps={{this.displayableGrains.length}}
            @onElementRetry={{this.onElementRetry}}
            @passage={{@passage}}
            @onImageAlternativeTextOpen={{this.onImageAlternativeTextOpen}}
            @onVideoTranscriptionOpen={{this.onVideoTranscriptionOpen}}
            @onElementAnswer={{this.onElementAnswer}}
            @onSelfAssessment={{this.onSelfAssessment}}
            @onStepperNextStep={{this.onStepperNextStep}}
            @canMoveToNextGrain={{this.grainCanMoveToNextGrain index}}
            @onGrainContinue={{this.onGrainContinue}}
            @onGrainSkip={{this.onGrainSkip}}
            @shouldDisplayTerminateButton={{this.grainShouldDisplayTerminateButton index}}
            @hasJustAppeared={{this.hasGrainJustAppeared index}}
            @onModuleTerminate={{this.onModuleTerminate}}
            @onVideoPlay={{this.onVideoPlay}}
            @onFileDownload={{this.onFileDownload}}
            @onExpandToggle={{this.onExpandToggle}}
          />
        {{/each}}
      </div>
    </main>
  </template>
}
