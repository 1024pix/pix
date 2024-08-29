import PixBanner from '@1024pix/pix-ui/components/pix-banner';
import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixRadioButton from '@1024pix/pix-ui/components/pix-radio-button';
import PixTextarea from '@1024pix/pix-ui/components/pix-textarea';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { not } from 'ember-truth-helpers';
import PixFieldset from 'pix-admin/components/ui/pix-fieldset';

export default class Update extends Component {
  @service notifications;
  @service accessControl;
  @service store;
  @service intl;

  @tracked displayIsForAbsoluteNoviceWarning;

  constructor() {
    super(...arguments);
    this.form = this.store.createRecord('campaign-form');
    this.form.name = this.args.campaign.name;
    this.form.title = this.args.campaign.title;
    this.form.customLandingPageText = this.args.campaign.customLandingPageText;
    this.form.customResultPageText = this.args.campaign.customResultPageText;
    this.form.customResultPageButtonText = this.args.campaign.customResultPageButtonText;
    this.form.customResultPageButtonUrl = this.args.campaign.customResultPageButtonUrl;
    this.form.multipleSendings = this.args.campaign.multipleSendings;
    this.form.isForAbsoluteNovice = this.args.campaign.isForAbsoluteNovice;

    this.displayIsForAbsoluteNoviceWarning = this.args.campaign.isForAbsoluteNovice;
  }

  @action
  updateFormValue(key, event) {
    if (key === 'isForAbsoluteNovice') {
      this.form[key] = event.target.value === 'true';

      this.displayIsForAbsoluteNoviceWarning = this.form[key];
    } else {
      this.form[key] = event.target.value;
    }
  }

  @action
  updateFormCheckBoxValue(key) {
    this.form[key] = !this.form[key];
  }

  get displayIsForAbsoluteNoviceChoice() {
    return this.args.campaign.isTypeAssessment && this.accessControl.hasAccessToCampaignIsForAbsoluteNoviceEditionScope;
  }

  get nameError() {
    if (this.form.get('validations.attrs.name').isInvalid) {
      return { message: this.form.get('validations.attrs.name').message, state: 'error' };
    }
    return null;
  }

  get titleError() {
    if (this.form.get('validations.attrs.title').isInvalid) {
      return { message: this.form.get('validations.attrs.title').message, state: 'error' };
    }
    return null;
  }

  get customLandingPageTextError() {
    if (this.form.get('validations.attrs.customLandingPageText').isInvalid) {
      return { message: this.form.get('validations.attrs.customLandingPageText').message, state: 'error' };
    }
    return null;
  }

  get customResultPageTextError() {
    if (this.form.get('validations.attrs.customResultPageText').isInvalid) {
      return { message: this.form.get('validations.attrs.customResultPageText').message, state: 'error' };
    }
    return null;
  }

  get customResultPageButtonTextError() {
    if (this.form.get('validations.attrs.customResultPageButtonText').isInvalid) {
      return { message: this.form.get('validations.attrs.customResultPageButtonText').message, state: 'error' };
    }
    return null;
  }

  get customResultPageButtonUrlError() {
    if (this.form.get('validations.attrs.customResultPageButtonUrl').isInvalid) {
      return { message: this.form.get('validations.attrs.customResultPageButtonUrl').message, state: 'error' };
    }
    return null;
  }

  async _checkFormValidation() {
    const { validations } = await this.form.validate();
    return validations.isValid;
  }

  async _update() {
    const campaign = this.args.campaign;
    campaign.name = this.form.name;
    campaign.title = this.form.title;
    campaign.customLandingPageText = this.form.customLandingPageText;
    campaign.customResultPageText = this.form.customResultPageText;
    campaign.customResultPageButtonText = this.form.customResultPageButtonText;
    campaign.customResultPageButtonUrl = this.form.customResultPageButtonUrl;
    campaign.multipleSendings = this.form.multipleSendings;
    campaign.isForAbsoluteNovice = this.form.isForAbsoluteNovice;

    try {
      await campaign.save();
      await this.notifications.success('Les modifications ont bien été enregistrées.');
      this.args.onExit();
    } catch (errorResponse) {
      campaign.rollbackAttributes();
      const errors = errorResponse.errors;
      const genericErrorMessage = this.intl.t('common.notifications.generic-error');

      if (!errors) {
        return this.notifications.error(genericErrorMessage);
      }
      return errorResponse.errors.forEach((error) => {
        if (error.status === '422') {
          return this.notifications.error(error.detail);
        }
        return this.notifications.error(genericErrorMessage);
      });
    }
  }

  @action
  async update(event) {
    event.preventDefault();
    if (await this._checkFormValidation()) {
      await this._update();
    }
  }

  <template>
    <section class="page-section">
      <h1>{{@campaign.name}}</h1>

      <p class="admin-form__mandatory-text">
        {{t "common.forms.mandatory-fields" htmlSafe=true}}
      </p>

      <form class="admin-form" {{on "submit" this.update}}>
        <div class="admin-form__content">
          <PixInput
            @id="name"
            @requiredLabel={{t "common.forms.mandatory"}}
            @errorMessage={{this.nameError.message}}
            @validationStatus={{this.nameError.state}}
            @value={{this.form.name}}
            {{on "change" (fn this.updateFormValue "name")}}
          >
            <:label>Nom de la campagne</:label>
          </PixInput>

          {{#if @campaign.isTypeAssessment}}
            <PixInput
              @id="title"
              @errorMessage={{this.titleError.message}}
              @validationStatus={{this.titleError.state}}
              @value={{this.form.title}}
              maxlength="50"
              {{on "change" (fn this.updateFormValue "title")}}
            >
              <:label>Titre du parcours</:label>
            </PixInput>
          {{/if}}

          <PixTextarea
            @id="customLandingPageText"
            @value={{this.form.customLandingPageText}}
            @errorMessage={{this.customLandingPageTextError.message}}
            @validationStatus={{this.customLandingPageTextError.state}}
            @maxlength="5000"
            rows="8"
            {{on "change" (fn this.updateFormValue "customLandingPageText")}}
          >
            <:label>Texte de la page d'accueil</:label>
          </PixTextarea>

          {{#if @campaign.isTypeAssessment}}
            <PixTextarea
              @id="customResultPageText"
              @value={{this.form.customResultPageText}}
              @errorMessage={{this.customResultPageTextError.message}}
              @validationStatus={{this.customResultPageTextError.state}}
              @maxlength="5000"
              rows="8"
              {{on "change" (fn this.updateFormValue "customResultPageText")}}
            >
              <:label>Texte de la page de fin de parcours</:label>
            </PixTextarea>

            <PixInput
              @id="customResultPageButtonText"
              @subLabel="Si un texte pour le bouton est saisi, une URL est également requise."
              @value={{this.form.customResultPageButtonText}}
              @errorMessage={{this.customResultPageButtonTextError.message}}
              @validationStatus={{this.customResultPageButtonTextError.state}}
              {{on "change" (fn this.updateFormValue "customResultPageButtonText")}}
            >
              <:label>Texte du bouton de la page de fin de parcours</:label>
            </PixInput>

            <PixInput
              @id="customResultPageButtonUrl"
              @subLabel="Si une URL pour le bouton est saisie, le texte est également requis."
              @value={{this.form.customResultPageButtonUrl}}
              @errorMessage={{this.customResultPageButtonUrlError.message}}
              @validationStatus={{this.customResultPageButtonUrlError.state}}
              {{on "change" (fn this.updateFormValue "customResultPageButtonUrl")}}
            >
              <:label>URL du bouton de la page de fin de parcours</:label>
            </PixInput>
          {{/if}}

          {{#unless @campaign.totalParticipationsCount}}
            <PixCheckbox
              @id="multipleSendings"
              @checked={{this.form.multipleSendings}}
              {{on "change" (fn this.updateFormCheckBoxValue "multipleSendings")}}
            >
              <:label>Envoi multiple</:label>
            </PixCheckbox>
          {{/unless}}

          {{#if this.displayIsForAbsoluteNoviceChoice}}
            <PixFieldset role="radiogroup">
              <:title>Voulez-vous passer cette campagne en <i>isForAbsoluteNovice</i></:title>
              <:content>
                <PixRadioButton
                  name="isForAbsoluteNovice"
                  @value={{true}}
                  {{on "change" (fn this.updateFormValue "isForAbsoluteNovice")}}
                  checked={{this.form.isForAbsoluteNovice}}
                >
                  <:label>{{t "common.words.yes"}}</:label>
                </PixRadioButton>

                <PixRadioButton
                  name="isForAbsoluteNovice"
                  @value={{false}}
                  {{on "change" (fn this.updateFormValue "isForAbsoluteNovice")}}
                  checked={{not this.form.isForAbsoluteNovice}}
                >
                  <:label>
                    {{t "common.words.no"}}
                  </:label>
                </PixRadioButton>
              </:content>
            </PixFieldset>

            {{#if this.displayIsForAbsoluteNoviceWarning}}
              <PixBanner @type="warning">
                <div class="is-for-absolute-novice-warning">
                  <p>Les campagnes
                    <strong><i>isForAbsoluteNovice</i></strong>
                    sont uniquement à destination des grands débutants et suppriment de ce fait les éléments suivants :</p>

                  <ul class="is-for-absolute-novice-warning__list">
                    <li>Didacticiel</li>
                    <li>Page d'accueil de la campagne</li>
                    <li>Envoi de résultats</li>
                  </ul>
                </div>
              </PixBanner>
            {{/if}}
          {{/if}}
        </div>

        <div class="admin-form__actions">
          <PixButton @triggerAction={{@onExit}} @variant="secondary" @size="small">
            {{t "common.actions.cancel"}}
          </PixButton>
          <PixButton @type="submit" @variant="success" @size="small">
            {{t "common.actions.save"}}
          </PixButton>
        </div>
      </form>
    </section>
  </template>
}
