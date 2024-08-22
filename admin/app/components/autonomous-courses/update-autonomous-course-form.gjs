import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixTextarea from '@1024pix/pix-ui/components/pix-textarea';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class UpdateAutonomousCourseForm extends Component {
  constructor() {
    super(...arguments);
  }

  @action
  updateAutonomousCourseValue(key, event) {
    this.args.autonomousCourse[key] = event.target.value;
  }

  @action
  onSubmit(event) {
    event.preventDefault();
    this.args.update();
  }

  noop() {}

  <template>
    <form class="form update-autonomous-course" {{on "submit" this.onSubmit}}>
      <span class="form__instructions">
        {{t "common.forms.mandatory-fields" htmlSafe=true}}
      </span>
      <PixInput
        class="form-field"
        @id="autonomousCourseName"
        required={{true}}
        @requiredLabel={{t "common.forms.mandatory"}}
        @value={{@autonomousCourse.internalTitle}}
        {{on "change" (fn this.updateAutonomousCourseValue "internalTitle")}}
      >
        <:label>Nom interne :</:label>
      </PixInput>
      <PixInput
        @id="nom-public"
        class="form-field"
        placeholder="Exemple&nbsp;:&nbsp;Le super nom de mon parcours autonome"
        required={{true}}
        maxlength="50"
        @value={{@autonomousCourse.publicTitle}}
        @requiredLabel={{t "common.forms.mandatory"}}
        @subLabel="Le nom du parcours autonome sera affiché sur la page de démarrage du candidat."
        {{on "change" (fn this.updateAutonomousCourseValue "publicTitle")}}
      >
        <:label>Nom public <small>(50 caractères maximum)</small> :</:label>
      </PixInput>
      <PixTextarea
        @id="text-page-accueil"
        @maxlength="5000"
        @value={{@autonomousCourse.customLandingPageText}}
        placeholder="Exemple : description, objectifs..."
        {{on "change" (fn this.updateAutonomousCourseValue "customLandingPageText")}}
      >
        <:label>Texte de la page d'accueil :</:label>
      </PixTextarea>
      <div class="form-actions">
        <PixButton type="reset" @variant="secondary" @size="small" @triggerAction={{@cancel}}>
          Annuler
        </PixButton>
        <PixButton @variant="success" @size="small" type="submit" @triggerAction={{this.noop}}>
          Sauvegarder les modifications
        </PixButton>
      </div>
    </form>
  </template>
}
