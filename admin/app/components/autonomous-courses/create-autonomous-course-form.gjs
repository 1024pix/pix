import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixFilterableAndSearchableSelect from '@1024pix/pix-ui/components/pix-filterable-and-searchable-select';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixTextarea from '@1024pix/pix-ui/components/pix-textarea';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import Card from 'pix-admin/components/card';

export default class CreateAutonomousCourseForm extends Component {
  @tracked submitting = false;
  constructor() {
    super(...arguments);
  }

  @action
  updateAutonomousCourseValue(key, event) {
    this.args.autonomousCourse[key] = event.target.value;
  }

  @action
  selectTargetProfile(targetProfileId) {
    this.args.autonomousCourse.targetProfileId = targetProfileId;
  }

  get targetProfileListOptions() {
    const options = this.args.targetProfiles.map((targetProfile) => ({
      value: targetProfile.id,
      label: targetProfile.name,
      category: targetProfile.category,
      order: 'OTHER' === targetProfile.category ? 1 : 0,
    }));

    options.sort((targetProfileA, targetProfileB) => {
      if (targetProfileA.order !== targetProfileB.order) {
        return targetProfileA.order - targetProfileB.order;
      }
      if (targetProfileA.category !== targetProfileB.category) {
        return targetProfileA.category.localeCompare(targetProfileB.category);
      }
      return targetProfileA.label.localeCompare(targetProfileB.label);
    });

    return options;
  }

  @action
  async onSubmit(event) {
    const autonomousCourse = {
      internalTitle: this.args.autonomousCourse.internalTitle,
      publicTitle: this.args.autonomousCourse.publicTitle,
      targetProfileId: this.args.autonomousCourse.targetProfileId,
      customLandingPageText: this.args.autonomousCourse.customLandingPageText,
    };
    try {
      this.submitting = true;
      await this.args.onSubmit(event, autonomousCourse);
    } finally {
      this.submitting = false;
    }
  }

  <template>
    <form class="admin-form" {{on "submit" this.onSubmit}}>
      <p class="admin-form__mandatory-text">
        {{t "common.forms.mandatory-fields" htmlSafe=true}}
      </p>
      <section class="admin-form__content admin-form__content--with-counters">
        <Card class="admin-form__card" @title="Informations techniques">
          <PixInput
            class="form-field"
            @id="autonomousCourseName"
            required="true"
            @requiredLabel={{t "common.forms.mandatory"}}
            {{on "change" (fn this.updateAutonomousCourseValue "internalTitle")}}
          >
            <:label>Nom interne :</:label>
          </PixInput>
          <PixFilterableAndSearchableSelect
            @placeholder="Choisir un profil cible"
            @options={{this.targetProfileListOptions}}
            @hideDefaultOption={{true}}
            @onChange={{this.selectTargetProfile}}
            @categoriesPlaceholder="Filtres"
            @value={{@autonomousCourse.targetProfileId}}
            @requiredLabel="Champ obligatoire"
            @errorMessage={{if
              @errors.autonomousCourse
              (t "api-error-messages.campaign-creation.target-profile-required")
            }}
            @isSearchable={{true}}
            @searchLabel="Recherchez un profil cible"
            @subLabel="Le profil cible doit être en accès simplifié et relié à l’organisation &quot;Organisation pour les parcours autonomes&quot;"
            required={{true}}
          >
            <:label>Quel profil cible voulez-vous associer à ce parcours autonome ?</:label>
            <:categoriesLabel>Sélectionner une ou plusieurs catégories de profils cibles</:categoriesLabel>
          </PixFilterableAndSearchableSelect>
        </Card>
        <Card class="admin-form__card" @title="Informations pour les utilisateurs">
          <PixInput
            @id="nom-public"
            class="form-field"
            placeholder="Exemple : Le super nom de mon parcours autonome"
            required={{true}}
            @requiredLabel="Champ obligatoire"
            maxlength="50"
            @subLabel="Le nom du parcours autonome sera affiché sur la page de démarrage du candidat."
            {{on "change" (fn this.updateAutonomousCourseValue "publicTitle")}}
          >
            <:label>Nom public <small>(50 caractères maximum)</small> :</:label>
          </PixInput>
          <PixTextarea
            @id="text-page-accueil"
            class="form-field"
            @maxlength="5000"
            placeholder="Exemple : description, objectifs..."
            {{on "change" (fn this.updateAutonomousCourseValue "customLandingPageText")}}
          >
            <:label>Texte de la page d'accueil :</:label>
          </PixTextarea>
        </Card>
      </section>
      <section class="admin-form__actions">
        <PixButton @variant="secondary" @size="large" @triggerAction={{@onCancel}}>Annuler
        </PixButton>
        <PixButton
          @variant="success"
          @size="large"
          @type="submit"
          @isLoading={{this.submitting}}
          @triggerAction={{this.noop}}
        >
          Créer le parcours autonome
        </PixButton>
      </section>
    </form>
  </template>
}
