import PixBlock from '@1024pix/pix-ui/components/pix-block';
import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class FlashAlgorithmConfiguration extends Component {
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

  <template>
    <PixBlock class="page-section">

      <h2 class="page-section__title">
        Configuration de l’algorithme de déroulé du test
      </h2>

      <form class="flash-algorithm-configuration-form">
        <PixInput @id="maximumAssessmentLength" @value={{this.form.maximumAssessmentLength}} type="number">
          <:label>Nombre de questions</:label>
        </PixInput>

        <PixInput @id="warmUpLength" @value={{this.form.warmUpLength}} type="number">
          <:label>Nombre de questions d'entrainement</:label>
        </PixInput>

        <PixInput
          @id="challengesBetweenSameCompetence"
          @value={{this.form.challengesBetweenSameCompetence}}
          type="number"
        >
          <:label>Nombre de questions entre 2 questions de la même compétence</:label>
        </PixInput>

        <PixInput @id="variationPercent" @value={{this.form.variationPercent}} type="number">
          <:label>Capage de la capacité (en % )</:label>
        </PixInput>

        <PixInput @id="variationPercentUntil" @value={{this.form.variationPercentUntil}} type="number">
          <:label>Nombre de questions pour le capage de la capacité</:label>
        </PixInput>

        <PixInput @id="doubleMeasuresUntil" @value={{this.form.doubleMeasuresUntil}} type="number">
          <:label>Nombre de questions pour la double mesure</:label>
        </PixInput>

        <PixInput
          @id="limitToOneQuestionPerTube"
          @value={{this.form.limitToOneQuestionPerTube}}
          checked={{this.form.limitToOneQuestionPerTube}}
          type="checkbox"
        >
          <:label>Limiter à une question par sujet</:label>
        </PixInput>

        <PixInput
          @id="enablePassageByAllCompetences"
          @value={{this.form.enablePassageByAllCompetences}}
          checked={{this.form.enablePassageByAllCompetences}}
          type="checkbox"
        >
          <:label>Forcer le passage par les 16 compétences</:label>
        </PixInput>

        <PixButton class="scoring-simulator__form-button" @type="submit">Créer</PixButton>
      </form>
    </PixBlock>
  </template>
}
