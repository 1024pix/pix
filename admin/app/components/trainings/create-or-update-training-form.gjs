import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixMultiSelect from '@1024pix/pix-ui/components/pix-multi-select';
import PixSegmentedControl from '@1024pix/pix-ui/components/pix-segmented-control';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import PixTextArea from '@1024pix/pix-ui/components/pix-textarea';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';
import set from 'lodash/set';
import ENV from 'pix-admin/config/environment';

import { optionsLocaleList, optionsModeList, optionsTypeList } from '../../models/training';
import Card from '../card';

class Form {
  @tracked title;
  @tracked internalTitle;
  @tracked link;
  @tracked type;
  @tracked duration = {
    days: 0,
    hours: 0,
    minutes: 0,
  };
  @tracked locales;
  @tracked editorLogoUrl;
  @tracked editorName;
  @tracked isDisabled;
  @tracked deliveryMode;
  @tracked registrationRequired;
  @tracked description;
  @tracked objectives;
  @tracked program;

  constructor({
    title,
    internalTitle,
    link,
    type,
    duration,
    locales,
    editorLogoUrl,
    editorName,
    isDisabled,
    deliveryMode,
    registrationRequired,
    description,
    objectives,
    program,
  } = {}) {
    this.title = title || null;
    this.internalTitle = internalTitle || null;
    this.link = link || null;
    this.type = type || null;
    this.duration = duration ? { ...duration } : { days: 0, hours: 0, minutes: 0 };
    this.locales = locales || [];
    this.editorLogoUrl = editorLogoUrl || null;
    this.editorName = editorName || null;
    this.isDisabled = isDisabled || false;
    this.deliveryMode = deliveryMode || null;
    this.registrationRequired = registrationRequired || false;
    this.description = description || null;
    this.objectives = objectives ? objectives.split(';').join(';\n') : null;
    this.program = program || null;
  }
}

const MODULIX_TYPE = 'modulix';
const MODULIX_EDITOR_LOGO_URL = 'https://assets.pix.org/contenu-formatif/editeur/pix-logo.svg';
const MODULIX_EDITOR_NAME = 'Pix';

export default class CreateOrUpdateTrainingForm extends Component {
  @service store;

  @tracked submitting = false;
  @tracked modules = [];

  constructor() {
    super(...arguments);
    this.optionsTypeList = optionsTypeList;
    this.optionsLocaleList = optionsLocaleList;
    this.optionsModeList = optionsModeList;
    this.form = new Form(this.args.model);
    this.loadModules();
  }

  get formattedSortedModuleValues() {
    const selectValues = this.modules.map((modules) => ({
      value: modules.link,
      label: modules.title,
    }));

    return selectValues.sort((moduleA, moduleB) => moduleA.label.localeCompare(moduleB.label));
  }

  async loadModules() {
    const modulesMetadata = this.store.peekAll('module-metadata');
    this.modules = modulesMetadata?.length ? modulesMetadata : await this.store.findAll('module-metadata');
  }

  @action
  updateForm(key, event) {
    set(this.form, key, event.target.value.trim());
  }

  @action
  toggleIsDisabled() {
    set(this.form, 'isDisabled', !this.form.isDisabled);
  }

  @action
  toggleRegistrationRequired() {
    this.form.registrationRequired = !this.form.registrationRequired;
  }

  @action
  updateSelect(key, value) {
    set(this.form, key, value);

    this.fillInputsForModulixTraining(key, value);
  }

  @action
  fillInputsForModulixTraining(key, value) {
    if (this.form.type === MODULIX_TYPE) {
      if (key === 'link') {
        const selectedModule = this.modules.find((module) => module.link === value);
        this.form.duration = { days: 0, hours: 0, minutes: selectedModule.duration };
      }

      if (!this.form.editorLogoUrl) {
        set(this.form, 'editorLogoUrl', MODULIX_EDITOR_LOGO_URL);
      }

      if (!this.form.editorName) {
        set(this.form, 'editorName', MODULIX_EDITOR_NAME);
      }
    }
  }

  @action
  async onSubmit(event) {
    event.preventDefault();
    const training = {
      title: this.form.title,
      internalTitle: this.form.internalTitle,
      link: this.form.link,
      type: this.form.type,
      duration: this.form.duration,
      locales: this.form.locales,
      editorName: this.form.editorName,
      isDisabled: this.form.isDisabled,
      editorLogoUrl: this.form.editorLogoUrl,
      deliveryMode: this.form.deliveryMode,
      registrationRequired: this.form.registrationRequired,
      description: this.form.description,
      objectives: this.form.objectives,
      program: this.form.program,
    };

    try {
      this.submitting = true;
      await this.args.onSubmit(training);
    } finally {
      this.submitting = false;
    }
  }

  get trainingEditorLogoUrl() {
    return ENV.APP.PIX_ASSETS_MANAGER_URL + '/list/contenu-formatif/editeur';
  }

  <template>
    <form class="admin-form admin-form--training" {{on "submit" this.onSubmit}}>
      <section class="admin-form__content">
        <Card class="admin-form__card" @title="Information sur le contenu formatif">
          <p class="admin-form__mandatory-text">Tous les champs sont obligatoires.</p>
          <PixInput
            @id="trainingTitle"
            required={{true}}
            aria-required={{true}}
            @value={{this.form.title}}
            {{on "change" (fn this.updateForm "title")}}
          >
            <:label>{{t "pages.trainings.training.details.title"}}</:label>
          </PixInput>
          <PixInput
            @id="trainingInternalTitle"
            required={{true}}
            aria-required={{true}}
            @value={{this.form.internalTitle}}
            {{on "change" (fn this.updateForm "internalTitle")}}
          >
            <:label>{{t "pages.trainings.training.details.internalTitle"}}</:label>
          </PixInput>
          <PixSelect
            @placeholder="-- Sélectionnez un format --"
            @value={{this.form.type}}
            @options={{this.optionsTypeList}}
            required={{true}}
            aria-required={{true}}
            @onChange={{fn this.updateSelect "type"}}
          >
            <:label>Format</:label>
          </PixSelect>

          {{#if this.form.type}}
            {{#if (eq this.form.type MODULIX_TYPE)}}
              <PixSelect
                @id="trainingModule"
                @placeholder="-- Sélectionnez un module --"
                @options={{this.formattedSortedModuleValues}}
                @value={{this.form.link}}
                @onChange={{fn this.updateSelect "link"}}
                @hideDefaultOption={{true}}
                @isSearchable={{true}}
                @searchLabel="Module à rechercher"
                required={{true}}
                aria-required={{true}}
              >
                <:label>Module</:label>
              </PixSelect>
            {{else}}
              <PixInput
                @id="trainingLink"
                required={{true}}
                aria-required={{true}}
                @value={{this.form.link}}
                {{on "change" (fn this.updateForm "link")}}
              >
                <:label>Lien</:label>
              </PixInput>
            {{/if}}
          {{/if}}

          <div class="admin-form--training__duration">
            <PixInput
              @id="trainingDaysDuration"
              min="0"
              required={{true}}
              aria-required={{true}}
              type="number"
              @value={{this.form.duration.days}}
              {{on "change" (fn this.updateForm "duration.days")}}
            >
              <:label>Jours (JJ)</:label>
            </PixInput>
            <PixInput
              @id="trainingHoursDuration"
              min="0"
              max="23"
              required={{true}}
              aria-required={{true}}
              type="number"
              @value={{this.form.duration.hours}}
              {{on "change" (fn this.updateForm "duration.hours")}}
            >
              <:label>Heures (HH)</:label>
            </PixInput>
            <PixInput
              @id="trainingMinutesDuration"
              required={{true}}
              min="0"
              max="59"
              aria-required={{true}}
              type="number"
              @value={{this.form.duration.minutes}}
              {{on "change" (fn this.updateForm "duration.minutes")}}
            >
              <:label>Minutes (MM)</:label>
            </PixInput>
          </div>
          <PixMultiSelect
            @id="trainingLocales"
            @placeholder={{t "pages.trainings.training.form.locales.placeholder"}}
            @options={{this.optionsLocaleList}}
            @values={{this.form.locales}}
            @onChange={{fn this.updateSelect "locales"}}
            required={{true}}
            aria-required={{true}}
          >
            <:label>{{t "pages.trainings.training.form.locales.label"}}</:label>
            <:default as |option|>{{option.label}}</:default>
          </PixMultiSelect>
          <PixInput
            @id="trainingEditorLogoUrl"
            @subLabel="Exemple : {{MODULIX_EDITOR_LOGO_URL}}"
            required={{true}}
            aria-required={{true}}
            @value={{this.form.editorLogoUrl}}
            {{on "change" (fn this.updateForm "editorLogoUrl")}}
          >
            <:label>Url du logo de l'éditeur (.svg)</:label>
          </PixInput>
          <a
            href={{this.trainingEditorLogoUrl}}
            target="_blank"
            rel="noopener noreferrer"
            class="training__logo-url-link"
          >
            Voir la liste des logos éditeur
          </a>
          <PixInput
            @id="trainingEditorName"
            @subLabel="Exemple: Ministère de l'Éducation nationale et de la Jeunesse. Liberté égalité fraternité"
            required={{true}}
            aria-required={{true}}
            @value={{this.form.editorName}}
            {{on "change" (fn this.updateForm "editorName")}}
          >
            <:label>Nom de l'éditeur</:label>
          </PixInput>
          {{#if @model}}
            <PixCheckbox @checked={{this.form.isDisabled}} {{on "change" this.toggleIsDisabled}}>
              <:label>Mettre en pause</:label>
            </PixCheckbox>
          {{/if}}
        </Card>
        <Card class="admin-form__card" @title={{t "pages.trainings.training.form.recommendation-engine.card-title"}}>
          <PixSelect
            @placeholder={{t "pages.trainings.training.form.recommendation-engine.delivery-mode.placeholder"}}
            @value={{this.form.deliveryMode}}
            @options={{this.optionsModeList}}
            @onChange={{fn this.updateSelect "deliveryMode"}}
          >
            <:label>{{t "pages.trainings.training.form.recommendation-engine.delivery-mode.label"}}</:label>
          </PixSelect>
          <PixSegmentedControl
            @toggled={{this.form.registrationRequired}}
            @onChange={{this.toggleRegistrationRequired}}
          >
            <:label>{{t "pages.trainings.training.form.recommendation-engine.registration-required.label"}}</:label>
            <:viewA>{{t "common.words.no"}}</:viewA>
            <:viewB>{{t "common.words.yes"}}</:viewB>
          </PixSegmentedControl>
          <PixTextArea
            @id="trainingDescription"
            rows="4"
            value={{this.form.description}}
            {{on "change" (fn this.updateForm "description")}}
          >
            <:label>{{t "pages.trainings.training.form.recommendation-engine.description.label"}}</:label>
          </PixTextArea>
          <PixTextArea
            @id="trainingObjectives"
            @subLabel={{t "pages.trainings.training.form.recommendation-engine.objectives.sub-label"}}
            rows="6"
            value={{this.form.objectives}}
            {{on "change" (fn this.updateForm "objectives")}}
          >
            <:label>{{t "pages.trainings.training.form.recommendation-engine.objectives.label"}}</:label>
          </PixTextArea>
          <PixTextArea
            @id="trainingProgram"
            rows="6"
            value={{this.form.program}}
            {{on "change" (fn this.updateForm "program")}}
          >
            <:label>{{t "pages.trainings.training.form.recommendation-engine.program.label"}}</:label>
          </PixTextArea>
        </Card>
      </section>
      <section class="admin-form__actions">
        <PixButton @variant="secondary" @size="large" @triggerAction={{@onCancel}}>
          {{t "common.actions.cancel"}}
        </PixButton>
        <PixButton @variant="success" @size="large" @type="submit" @isLoading={{this.submitting}}>
          {{if @model "Modifier" "Créer"}}
          le contenu formatif
        </PixButton>
      </section>
    </form>
  </template>
}
