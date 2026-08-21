import { PixBannerAlert, PixButton, PixCheckbox, PixInput, PixRadioButton, PixTextarea } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { not, or } from 'ember-truth-helpers';
import Joi from 'joi';
import PixFieldset from 'pix-admin/components/ui/pix-fieldset';
import { FormValidator } from 'pix-admin/utils/form-validator';

export default class Update extends Component {
  @service pixToast;
  @service accessControl;
  @service store;
  @service intl;

  @tracked displayIsForAbsoluteNoviceWarning;

  validator = new FormValidator(CAMPAIGN_FORM_SCHEMA);

  constructor() {
    super(...arguments);
    this.form = {
      name: this.args.campaign.name,
      title: this.args.campaign.title,
      customLandingPageText: this.args.campaign.customLandingPageText,
      customResultPageText: this.args.campaign.customResultPageText,
      customResultPageButtonText: this.args.campaign.customResultPageButtonText,
      customResultPageButtonUrl: this.args.campaign.customResultPageButtonUrl,
      multipleSendings: this.args.campaign.multipleSendings,
      isForAbsoluteNovice: this.args.campaign.isForAbsoluteNovice,
    };

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
    this.validator.validateField(key, this.form[key]);
  }

  @action
  updateFormCheckBoxValue(key) {
    this.form[key] = !this.form[key];
    this.validator.validateField(key, this.form[key]);
  }

  get displayIsForAbsoluteNoviceChoice() {
    return this.args.campaign.isTypeAssessment && this.accessControl.hasAccessToCampaignIsForAbsoluteNoviceEditionScope;
  }

  @action
  async update(event) {
    event.preventDefault();
    const isValid = this.validator.validate(this.form);
    if (!isValid) return;

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
      await this.pixToast.sendSuccessNotification({ message: 'Les modifications ont bien été enregistrées.' });
      this.args.onExit();
    } catch (errorResponse) {
      campaign.rollbackAttributes();
      const errors = errorResponse.errors;
      const genericErrorMessage = this.intl.t('common.notifications.generic-error');

      if (!errors) {
        return this.pixToast.sendErrorNotification({ message: genericErrorMessage });
      }
      return errorResponse.errors.forEach((error) => {
        if (error.status === '422') {
          return this.pixToast.sendErrorNotification({ message: error.detail });
        }
        return this.pixToast.sendErrorNotification({ message: genericErrorMessage });
      });
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
            @errorMessage={{this.validator.errors.name}}
            @validationStatus={{if this.validator.errors.name "error"}}
            @value={{this.form.name}}
            {{on "change" (fn this.updateFormValue "name")}}
          >
            <:label>Nom de la campagne</:label>
          </PixInput>

          {{#if @campaign.isTypeAssessment}}
            <PixInput
              @id="title"
              @errorMessage={{this.validator.errors.title}}
              @validationStatus={{if this.validator.errors.title "error"}}
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
            @errorMessage={{this.validator.errors.customLandingPageText}}
            @validationStatus={{if this.validator.errors.customLandingPageText "error"}}
            @maxlength="5000"
            rows="8"
            {{on "change" (fn this.updateFormValue "customLandingPageText")}}
          >
            <:label>Texte de la page d'accueil</:label>
          </PixTextarea>

          {{#if (or @campaign.isTypeAssessment @campaign.isTypeExam)}}
            <PixTextarea
              @id="customResultPageText"
              @value={{this.form.customResultPageText}}
              @errorMessage={{this.validator.errors.customResultPageText}}
              @validationStatus={{if this.validator.errors.customResultPageText "error"}}
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
              @errorMessage={{this.validator.errors.customResultPageButtonText}}
              @validationStatus={{if this.validator.errors.customResultPageButtonText "error"}}
              {{on "change" (fn this.updateFormValue "customResultPageButtonText")}}
            >
              <:label>Texte du bouton de la page de fin de parcours</:label>
            </PixInput>

            <PixInput
              @id="customResultPageButtonUrl"
              @subLabel="Si une URL pour le bouton est saisie, le texte est également requis."
              @value={{this.form.customResultPageButtonUrl}}
              @errorMessage={{this.validator.errors.customResultPageButtonUrl}}
              @validationStatus={{if this.validator.errors.customResultPageButtonUrl "error"}}
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
              <PixBannerAlert @type="warning">
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
              </PixBannerAlert>
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

const CAMPAIGN_FORM_SCHEMA = Joi.object({
  name: Joi.string().min(1).max(255).required().messages({
    'any.required': 'Le nom ne peut pas être vide',
    'string.empty': 'Le nom ne peut pas être vide',
    'string.min': 'La longueur du nom ne doit pas excéder 255 caractères',
    'string.max': 'La longueur du nom ne doit pas excéder 255 caractères',
  }),
  title: Joi.string().min(0).max(255).empty(['', null]).messages({
    'string.max': 'La longueur du titre ne doit pas excéder 255 caractères',
  }),
  customLandingPageText: Joi.string().min(0).max(5000).empty(['', null]).messages({
    'string.max': "La longueur du texte de la page d'accueil ne doit pas excéder 5000 caractères",
  }),
  customResultPageText: Joi.string().min(0).max(5000).empty(['', null]).messages({
    'string.max': 'La longueur du texte de la page de résultat ne doit pas excéder 5000 caractères',
  }),
  customResultPageButtonText: Joi.string().min(0).max(255).empty(['', null]).messages({
    'string.max': 'La longueur du texte ne doit pas excéder 255 caractères',
  }),
  customResultPageButtonUrl: Joi.string().uri({ allowRelative: true }).empty(['', null]).messages({
    'string.uri': 'Ce champ doit être une URL valide',
  }),
  multipleSendings: Joi.boolean(),
  isForAbsoluteNovice: Joi.boolean(),
});
