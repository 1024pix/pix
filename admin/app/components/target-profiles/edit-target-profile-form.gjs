import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixMessage from '@1024pix/pix-ui/components/pix-message';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import PixTextarea from '@1024pix/pix-ui/components/pix-textarea';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import { optionsCategoryList } from '../../models/target-profile';
import Card from '../card';
import TubesSelection from '../common/tubes-selection';

export default class CreateTargetProfileForm extends Component {
  @service notifications;
  @service router;

  @tracked submitting = false;
  selectedTubes = [];

  constructor() {
    super(...arguments);
    this.optionsList = optionsCategoryList;
  }

  @action
  updateTubes(tubesWithLevel) {
    this.selectedTubes = tubesWithLevel.map(({ id, level }) => ({
      id,
      level,
    }));
  }

  @action
  handleInputValue(key, event) {
    this.args.targetProfile[key] = event.target.value;
  }

  @action
  handleSelectChange(key, value) {
    this.args.targetProfile[key] = value;
  }

  @action
  handleCheckboxChange(key, event) {
    this.args.targetProfile[key] = event.target.checked;
  }

  @action
  async onSubmit(event) {
    event.preventDefault();

    try {
      this.submitting = true;
      await this.args.onSubmit(event, this.selectedTubes);
    } finally {
      this.submitting = false;
    }
  }

  <template>
    <form class="admin-form">
      <p class="admin-form__mandatory-text">
        {{t "common.forms.mandatory-fields" htmlSafe=true}}
      </p>
      <section class="admin-form__content admin-form__content--with-counters">
        <Card class="admin-form__card" @title="Information sur le profil cible">
          <PixInput
            @id="targetProfileName"
            required={{true}}
            @requiredLabel={{t "common.forms.mandatory"}}
            aria-required={{true}}
            @value={{@targetProfile.name}}
            {{on "change" (fn this.handleInputValue "name")}}
          >
            <:label>Nom :</:label>
          </PixInput>

          <PixSelect
            @onChange={{fn this.handleSelectChange "category"}}
            @value={{@targetProfile.category}}
            @options={{this.optionsList}}
            @placeholder="-"
            @hideDefaultOption={{true}}
            required={{true}}
            @requiredLabel={{t "common.forms.mandatory"}}
            aria-required={{true}}
          >
            <:label>Catégorie :</:label>
          </PixSelect>

          {{#unless @updateMode}}
            <PixInput
              @id="organizationId"
              type="number"
              @errorMessage=""
              required={{true}}
              @requiredLabel={{t "common.forms.mandatory"}}
              aria-required={{true}}
              placeholder="7777"
              value={{@targetProfile.ownerOrganizationId}}
              {{on "change" (fn this.handleInputValue "ownerOrganizationId")}}
            >
              <:label>Identifiant de l'organisation de référence :</:label>
            </PixInput>

            <PixCheckbox @checked={{@targetProfile.isPublic}} onChange={{fn this.handleCheckboxChange "isPublic"}}>
              <:label>
                Public
                <small>(un profil cible marqué comme public sera affecté à toutes les organisations)</small>
              </:label>
            </PixCheckbox>
          {{/unless}}

          <PixCheckbox
            @checked={{@targetProfile.areKnowledgeElementsResettable}}
            onChange={{fn this.handleCheckboxChange "areKnowledgeElementsResettable"}}
          >
            <:label>{{t "pages.target-profiles.resettable-checkbox.label"}}</:label>
          </PixCheckbox>
        </Card>

        {{#if @targetProfile.hasLinkedCampaign}}
          <PixMessage @withIcon={{true}}>
            Le référentiel n'est pas modifiable car le profil cible est déjà relié à une campagne.
          </PixMessage>
        {{else}}
          <TubesSelection
            @frameworks={{@frameworks}}
            @initialCappedTubes={{@targetProfile.cappedTubes}}
            @initialAreas={{@targetProfile.areas}}
            @onChange={{this.updateTubes}}
            @displayJsonImportButton={{true}}
            @displayDeviceCompatibility={{true}}
            @displaySkillDifficultyAvailability={{true}}
          />
        {{/if}}

        <Card class="admin-form__card" @title="Personnalisation">
          <PixInput
            @id="imageUrl"
            @subLabel="L'url à saisir doit être celle d'OVH. Veuillez
              vous rapprocher des équipes tech et produit pour la réalisation de celle-ci."
            value={{@targetProfile.imageUrl}}
            {{on "change" (fn this.handleInputValue "imageUrl")}}
          >
            <:label>Lien de l'image du profil cible :</:label>
          </PixInput>

          <PixTextarea
            @id="description"
            @maxlength="500"
            rows="4"
            @value={{@targetProfile.description}}
            {{on "change" (fn this.handleInputValue "description")}}
          >
            <:label>Description :</:label>
          </PixTextarea>
          <PixTextarea
            @id="comment"
            @maxlength="500"
            rows="4"
            @value={{@targetProfile.comment}}
            {{on "change" (fn this.handleInputValue "comment")}}
          >
            <:label>Commentaire (usage interne) :</:label>
          </PixTextarea>
        </Card>
      </section>
      <section class="admin-form__actions">
        <PixButton @variant="secondary" @size="large" @triggerAction={{@onCancel}}>
          {{t "common.actions.cancel"}}
        </PixButton>
        <PixButton
          @variant="success"
          @size="large"
          @type="submit"
          @isLoading={{this.submitting}}
          @triggerAction={{this.onSubmit}}
        >
          {{#if @updateMode}}
            Modifier le profil cible
          {{else}}
            Créer le profil cible
          {{/if}}
        </PixButton>
      </section>
    </form>
  </template>
}
