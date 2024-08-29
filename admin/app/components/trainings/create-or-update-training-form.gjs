import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import set from 'lodash/set';

import { optionsLocaleList, optionsTypeList } from '../../models/training';
import Card from '../card';

class Form {
  @tracked title;
  @tracked link;
  @tracked type;
  @tracked duration = {
    days: 0,
    hours: 0,
    minutes: 0,
  };
  @tracked locale;
  @tracked editorLogoUrl;
  @tracked editorName;
  @tracked isDisabled;

  constructor({ title, link, type, duration, locale, editorLogoUrl, editorName, isDisabled } = {}) {
    this.title = title || null;
    this.link = link || null;
    this.type = type || null;
    this.duration = duration || { days: 0, hours: 0, minutes: 0 };
    this.locale = locale || null;
    this.editorLogoUrl = editorLogoUrl?.split('/').at(-1) || null;
    this.editorName = editorName || null;
    this.isDisabled = isDisabled || false;
  }
}

export default class CreateOrUpdateTrainingForm extends Component {
  @service notifications;

  @tracked submitting = false;

  constructor() {
    super(...arguments);
    this.optionsTypeList = optionsTypeList;
    this.optionsLocaleList = optionsLocaleList;
    this.form = new Form(this.args.model);
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
  updateSelect(key, value) {
    set(this.form, key, value);
  }

  @action
  async onSubmit(event) {
    event.preventDefault();

    const training = {
      title: this.form.title,
      link: this.form.link,
      type: this.form.type,
      duration: this.form.duration,
      locale: this.form.locale,
      editorName: this.form.editorName,
      isDisabled: this.form.isDisabled,
    };
    training.editorLogoUrl = `https://images.pix.fr/contenu-formatif/editeur/${this.form.editorLogoUrl}`;

    try {
      this.submitting = true;
      await this.args.onSubmit(training);
    } finally {
      this.submitting = false;
    }
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
            <:label>Titre</:label>
          </PixInput>
          <PixInput
            @id="trainingLink"
            required={{true}}
            aria-required={{true}}
            @value={{this.form.link}}
            {{on "change" (fn this.updateForm "link")}}
          >
            <:label>Lien</:label>
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
          <PixSelect
            @id="trainingLocale"
            @placeholder="-- Sélectionnez une langue --"
            @options={{this.optionsLocaleList}}
            @value={{this.form.locale}}
            @onChange={{fn this.updateSelect "locale"}}
            required={{true}}
            aria-required={{true}}
          >
            <:label>Langue localisée</:label>
          </PixSelect>
          <div class="admin-form--training__logo-url-input">
            <PixInput
              @id="trainingEditorLogoUrl"
              @subLabel="Exemple : logo-ministere-education-nationale-et-jeunesse.svg"
              required={{true}}
              aria-required={{true}}
              placeholder="logo-ministere-education-nationale-et-jeunesse.svg"
              @value={{this.form.editorLogoUrl}}
              {{on "change" (fn this.updateForm "editorLogoUrl")}}
            >
              <:label>Nom du fichier du logo éditeur (.svg)</:label>
            </PixInput>
            <small>
              <a
                href="https://1024pix.github.io/pix-images-list/editeurs-cf.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                Voir la liste des logos éditeur
              </a>
            </small>
          </div>
          <PixInput
            @id="trainingEditorName"
            @subLabel="Exemple: Ministère de l'Éducation nationale et de la Jeunesse. Liberté égalité fraternité"
            required={{true}}
            aria-required={{true}}
            placeholder="Ministère de l'Éducation nationale et de la Jeunesse. Liberté égalité fraternité."
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
