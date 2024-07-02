import PixBlock from '@1024pix/pix-ui/components/pix-block';
import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class FlashAlgorithmConfiguration extends Component {
  @service store;
  @service notifications;
  @tracked form = {
    maximumAssessmentLength: this.args.model.maximumAssessmentLength,
    warmUpLength: this.args.model.warmUpLength,
    challengesBetweenSameCompetence: this.args.model.challengesBetweenSameCompetence,
    variationPercent: this.args.model.variationPercent,
    variationPercentUntil: this.args.model.variationPercentUntil,
    doubleMeasuresUntil: this.args.model.doubleMeasuresUntil,
    limitToOneQuestionPerTube: this.args.model.limitToOneQuestionPerTube,
    enablePassageByAllCompetences: this.args.model.enablePassageByAllCompetences,
  };

  @action
  async onCreateFlashAlgorithmConfiguration(event) {
    event.preventDefault();
    const adapter = this.store.adapterFor('flash-algorithm-configuration');
    try {
      await adapter.createRecord(this.form);
      this.notifications.success('La configuration a été créée');
    } catch (errorResponse) {
      this.notifications.error("La configuration n'a pu être créée");
    }
  }

  @action
  updateNumberValues(event) {
    this.form = { ...this.form, [event.target.id]: event.target.value };
  }

  @action
  updateCheckboxValues(event) {
    this.form = { ...this.form, [event.target.id]: event.target.checked };
  }

  <template>
    <PixBlock class="page-section">

      <h2 class="page-section__title">
        Configuration de l’algorithme de déroulé du test
      </h2>

      <form class="flash-algorithm-configuration-form">
        <PixInput
          {{on "input" this.updateNumberValues}}
          @id="maximumAssessmentLength"
          @value={{this.form.maximumAssessmentLength}}
          type="number"
          min="0"
        >
          <:label>Nombre de questions</:label>
        </PixInput>

        <PixInput
          {{on "input" this.updateNumberValues}}
          @id="warmUpLength"
          @value={{this.form.warmUpLength}}
          type="number"
          min="0"
        >
          <:label>Nombre de questions d'entrainement</:label>
        </PixInput>

        <PixInput
          {{on "input" this.updateNumberValues}}
          @id="challengesBetweenSameCompetence"
          @value={{this.form.challengesBetweenSameCompetence}}
          type="number"
          min="0"
        >
          <:label>Nombre de questions entre 2 questions de la même compétence</:label>
        </PixInput>

        <PixInput
          {{on "input" this.updateNumberValues}}
          @id="variationPercent"
          @value={{this.form.variationPercent}}
          type="number"
          min="0"
        >
          <:label>Capage de la capacité (en % )</:label>
        </PixInput>

        <PixInput
          {{on "input" this.updateNumberValues}}
          @id="variationPercentUntil"
          @value={{this.form.variationPercentUntil}}
          type="number"
          min="0"
        >
          <:label>Nombre de questions pour le capage de la capacité</:label>
        </PixInput>

        <PixInput
          {{on "input" this.updateNumberValues}}
          @id="doubleMeasuresUntil"
          @value={{this.form.doubleMeasuresUntil}}
          type="number"
          min="0"
        >
          <:label>Nombre de questions pour la double mesure</:label>
        </PixInput>

        <PixCheckbox
          {{on "input" this.updateCheckboxValues}}
          @id="limitToOneQuestionPerTube"
          @value={{this.form.limitToOneQuestionPerTube}}
          checked={{this.form.limitToOneQuestionPerTube}}
          type="checkbox"
        >
          <:label>Limiter à une question par sujet</:label>
        </PixCheckbox>

        <PixCheckbox
          {{on "input" this.updateCheckboxValues}}
          @id="enablePassageByAllCompetences"
          @value={{this.form.enablePassageByAllCompetences}}
          checked={{this.form.enablePassageByAllCompetences}}
          type="checkbox"
        >
          <:label>Forcer le passage par les 16 compétences</:label>
        </PixCheckbox>

        <PixButton
          class="scoring-simulator__form-button"
          @type="submit"
          @triggerAction={{this.onCreateFlashAlgorithmConfiguration}}
        >Créer</PixButton>
      </form>
    </PixBlock>
  </template>
}
