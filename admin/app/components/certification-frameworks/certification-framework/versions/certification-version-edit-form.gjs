import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';
import Card from 'pix-admin/components/card';
import formatDateToStandard from 'pix-admin/utils/date';

export default class CertificationVersionEditForm extends Component {
  @service store;
  @service router;
  @service intl;
  @service pixToast;

  get formattedAssessmentDuration() {
    const minutes = this.args.version.assessmentDuration;
    if (minutes === null) {
      return null;
    }

    return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
  }

  get formattedStartDate() {
    return this.args.version.startDate ? formatDateToStandard(this.args.version.startDate) : null;
  }

  @action
  updateStartDate(event) {
    this.args.version.startDate = new Date(event.target.value);
  }

  @action
  updateAssessmentDuration(event) {
    const formattedDuration = event.target.value;
    if (!formattedDuration) {
      this.args.version.assessmentDuration = null;
    } else {
      const [hours, minutes] = formattedDuration.split(':').map(Number);
      this.args.version.assessmentDuration = hours * 60 + minutes;
    }
  }

  @action
  updateDefaultProbabilityToPickChallenge(event) {
    this.args.version.defaultProbabilityToPickChallenge =
      event.target.value.length > 0 ? parseInt(event.target.value) : null;
  }

  @action
  updateVariationPercent(event) {
    this.args.version.variationPercent = event.target.value.length > 0 ? parseInt(event.target.value) : null;
  }

  @action
  updateDefaultCandidateCapacity(event) {
    this.args.version.defaultCandidateCapacity = event.target.value.length > 0 ? parseInt(event.target.value) : null;
  }

  @action
  updateMaximumAssessmentLength(event) {
    this.args.version.maximumAssessmentLength = event.target.value.length > 0 ? parseInt(event.target.value) : null;
  }

  @action
  updateMinimumAnswersRequiredForValidation(event) {
    this.args.version.minimumAnswersRequiredForValidation =
      event.target.value.length > 0 ? parseInt(event.target.value) : null;
  }

  @action
  updateChallengesBetweenSameCompetence(event) {
    this.args.version.challengesBetweenSameCompetence =
      event.target.value.length > 0 ? parseInt(event.target.value) : null;
  }

  @action
  updateLimitToOneQuestionPerTube() {
    this.args.version.limitToOneQuestionPerTube = !this.args.version.limitToOneQuestionPerTube;
  }

  @action
  updateEnablePassageByAllCompetences() {
    this.args.version.enablePassageByAllCompetences = !this.args.version.enablePassageByAllCompetences;
  }

  @action
  async saveVersion() {
    try {
      await this.args.version.save();
      this.pixToast.sendSuccessNotification({
        message: this.intl.t(
          'components.certification-frameworks.certification-framework.versions.edit.success-notification',
        ),
      });
      this.router.transitionTo('authenticated.certification-frameworks.certification-framework');
    } catch (err) {
      this.pixToast.sendErrorNotification({ message: err.errors?.[0].detail });
    }
  }

  <template>
    <Card @title="Configuration de l’algorithme de déroulé du test">
      <form class="versions-edit__form">
        <PixInput
          type="date"
          required={{true}}
          @requiredLabel={{t "common.forms.mandatory"}}
          @value={{this.formattedStartDate}}
          {{on "change" this.updateStartDate}}
        >
          <:label>
            {{t "components.certification-frameworks.certification-framework.versions.edit.start-date-label"}}</:label>
        </PixInput>
        <PixInput
          type="time"
          required={{true}}
          @requiredLabel={{t "common.forms.mandatory"}}
          @value={{this.formattedAssessmentDuration}}
          {{on "change" this.updateAssessmentDuration}}
        >
          <:label>{{t
              "components.certification-frameworks.certification-framework.versions.edit.assessment-duration-label"
            }}</:label>
        </PixInput>
        <PixInput
          type="number"
          required={{true}}
          @requiredLabel={{t "common.forms.mandatory"}}
          @value={{@version.defaultProbabilityToPickChallenge}}
          {{on "change" this.updateDefaultProbabilityToPickChallenge}}
        >
          <:label>{{t
              "components.certification-frameworks.certification-framework.versions.edit.default-probability-to-pick-challenge-label"
            }}</:label>
        </PixInput>
        <section>
          <PixInput
            type="number"
            required={{true}}
            @requiredLabel={{t "common.forms.mandatory"}}
            @value={{@version.variationPercent}}
            {{on "change" this.updateVariationPercent}}
          >
            <:label>{{t
                "components.certification-frameworks.certification-framework.versions.edit.variation-percent-label"
              }}</:label>
          </PixInput>
          <PixInput
            type="number"
            required={{true}}
            @requiredLabel={{t "common.forms.mandatory"}}
            @value={{@version.defaultCandidateCapacity}}
            {{on "change" this.updateDefaultCandidateCapacity}}
          >
            <:label>{{t
                "components.certification-frameworks.certification-framework.versions.edit.default-candidate-capacity-label"
              }}</:label>
          </PixInput>

        </section>
        <section>
          <PixInput
            type="number"
            required={{true}}
            @requiredLabel={{t "common.forms.mandatory"}}
            @value={{@version.maximumAssessmentLength}}
            {{on "change" this.updateMaximumAssessmentLength}}
          >
            <:label>{{t
                "components.certification-frameworks.certification-framework.versions.edit.maximum-assessment-length-label"
              }}</:label>
          </PixInput>
          <PixInput
            type="number"
            required={{true}}
            @requiredLabel={{t "common.forms.mandatory"}}
            @value={{@version.minimumAnswersRequiredForValidation}}
            {{on "change" this.updateMinimumAnswersRequiredForValidation}}
          >
            <:label>{{t
                "components.certification-frameworks.certification-framework.versions.edit.minimum-answers-required-for-validation-label"
              }}</:label>
          </PixInput>
        </section>
        <PixInput
          type="number"
          required={{true}}
          @requiredLabel={{t "common.forms.mandatory"}}
          @value={{@version.challengesBetweenSameCompetence}}
          {{on "change" this.updateChallengesBetweenSameCompetence}}
        >
          <:label>{{t
              "components.certification-frameworks.certification-framework.versions.edit.challenges-between-same-competence-label"
            }}</:label>
        </PixInput>

        <PixCheckbox
          @checked={{@version.limitToOneQuestionPerTube}}
          {{on "change" this.updateLimitToOneQuestionPerTube}}
        >
          <:label>{{t
              "components.certification-frameworks.certification-framework.versions.edit.limit-to-one-question-per-tube-label"
            }}</:label>
        </PixCheckbox>

        <PixCheckbox
          @checked={{@version.enablePassageByAllCompetences}}
          {{on "change" this.updateEnablePassageByAllCompetences}}
        >
          <:label>{{t
              "components.certification-frameworks.certification-framework.versions.edit.enable-passage-by-all-competences-label"
            }}</:label>
        </PixCheckbox>
      </form>
    </Card>

    <section class="actions-container">
      <PixButton
        @triggerAction={{this.saveVersion}}
        @isDisabled={{eq @version.hasDirtyAttributes false}}
        @variant="secondary"
      >
        {{t "components.certification-frameworks.certification-framework.versions.edit.submit-button"}}
      </PixButton>
      <PixButtonLink @route="authenticated.certification-frameworks.certification-framework" @variant="secondary">
        {{t "common.actions.cancel"}}
      </PixButtonLink>
    </section>
  </template>
}
