import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { trackedObject } from '@ember/reactive/collections';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import Card from 'pix-admin/components/card';
import formatDateToStandard from 'pix-admin/utils/date';

export default class CertificationVersionEditForm extends Component {
  @service store;
  @service router;
  @service intl;
  @service pixToast;

  validationForm = trackedObject({
    startDate: 'default',
    assessmentDuration: 'default',
    defaultProbabilityToPickChallenge: 'default',
    variationPercent: 'default',
    defaultCandidateCapacity: 'default',
    maximumAssessmentLength: 'default',
    minimumAnswersRequiredForValidation: 'default',
    challengesBetweenSameCompetence: 'default',
  });

  formatAssessmentDuration(assessmentDuration) {
    if (assessmentDuration === null || assessmentDuration === undefined) {
      return null;
    }

    return `${String(Math.floor(assessmentDuration / 60)).padStart(2, '0')}:${String(assessmentDuration % 60).padStart(2, '0')}`;
  }

  formatStartDate(startDate) {
    return startDate ? formatDateToStandard(startDate) : null;
  }

  @action
  getInputSubLabel(activeVersionValue) {
    if (activeVersionValue === null || activeVersionValue === undefined) return null;
    return this.intl.t('components.certification-frameworks.certification-framework.versions.edit.sublabel', {
      value: activeVersionValue,
    });
  }

  @action
  updateStartDate(event) {
    this.args.draftVersion.startDate = new Date(event.target.value);
  }

  @action
  updateAssessmentDuration(event) {
    const formattedDuration = event.target.value;
    if (!formattedDuration) {
      this.args.draftVersion.assessmentDuration = null;
    } else {
      const [hours, minutes] = formattedDuration.split(':').map(Number);
      this.args.draftVersion.assessmentDuration = hours * 60 + minutes;
    }
  }

  @action
  updateDefaultProbabilityToPickChallenge(event) {
    this.args.draftVersion.defaultProbabilityToPickChallenge = Number(event.target.valueAsNumber);
  }

  @action
  updateVariationPercent(event) {
    this.args.draftVersion.variationPercent = Number(event.target.valueAsNumber);
  }

  @action
  updateDefaultCandidateCapacity(event) {
    this.args.draftVersion.defaultCandidateCapacity = Number(event.target.valueAsNumber);
  }

  @action
  updateMaximumAssessmentLength(event) {
    this.args.draftVersion.maximumAssessmentLength = Number(event.target.valueAsNumber);
  }

  @action
  updateMinimumAnswersRequiredForValidation(event) {
    this.args.draftVersion.minimumAnswersRequiredForValidation = Number(event.target.valueAsNumber);
  }

  @action
  updateChallengesBetweenSameCompetence(event) {
    this.args.draftVersion.challengesBetweenSameCompetence = Number(event.target.valueAsNumber);
  }

  @action
  updateLimitToOneQuestionPerTube() {
    this.args.draftVersion.limitToOneQuestionPerTube = !this.args.draftVersion.limitToOneQuestionPerTube;
  }

  @action
  updateEnablePassageByAllCompetences() {
    this.args.draftVersion.enablePassageByAllCompetences = !this.args.draftVersion.enablePassageByAllCompetences;
  }

  get disableSubmit() {
    const hasFormValidationError = Object.values(this.validationForm).some((state) => state === 'error');
    return !this.args.draftVersion?.hasDirtyAttributes || hasFormValidationError;
  }

  @action
  validateInput(value, key) {
    if (value === null || value === undefined || value === 'Invalid Date' || Number.isNaN(value)) {
      this.validationForm[key] = 'error';
    } else {
      this.validationForm[key] = 'default';
    }
    return this.validationForm[key];
  }

  @action
  async saveVersion(event) {
    event.preventDefault();
    try {
      await this.args.draftVersion.save();
      this.pixToast.sendSuccessNotification({
        message: this.intl.t(
          'components.certification-frameworks.certification-framework.versions.edit.success-notification',
        ),
      });
      await this.store.findRecord('certification-framework', this.args.activeVersion.scope);
      this.router.transitionTo('authenticated.certification-frameworks.certification-framework');
    } catch (err) {
      this.pixToast.sendErrorNotification({ message: err.errors?.[0].detail });
    }
  }

  @action
  async noop(event) {
    event.preventDefault();
  }

  <template>
    <Card @title="Configuration de l’algorithme de déroulé du test">
      <form id="version-edit-form" class="versions-edit__form" {{on "submit" this.saveVersion}}>
        <PixInput
          type="date"
          required={{true}}
          @requiredLabel={{t "common.forms.mandatory"}}
          @subLabel={{this.getInputSubLabel (this.formatStartDate @activeVersion.startDate)}}
          @value={{this.formatStartDate @draftVersion.startDate}}
          @errorMessage={{t
            "components.certification-frameworks.certification-framework.versions.edit.validation-message-error"
          }}
          @validationStatus={{this.validateInput (this.formatStartDate @draftVersion.startDate) "startDate"}}
          {{on "change" this.updateStartDate}}
        >
          <:label>
            {{t "components.certification-frameworks.certification-framework.versions.edit.start-date-label"}}</:label>
        </PixInput>
        <PixInput
          type="time"
          required={{true}}
          @requiredLabel={{t "common.forms.mandatory"}}
          @subLabel={{this.getInputSubLabel (this.formatAssessmentDuration @activeVersion.assessmentDuration)}}
          @errorMessage={{t
            "components.certification-frameworks.certification-framework.versions.edit.validation-message-error"
          }}
          @validationStatus={{this.validateInput
            (this.formatAssessmentDuration @draftVersion.assessmentDuration)
            "assessmentDuration"
          }}
          @value={{this.formatAssessmentDuration @draftVersion.assessmentDuration}}
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
          @subLabel={{this.getInputSubLabel @activeVersion.defaultProbabilityToPickChallenge}}
          @errorMessage={{t
            "components.certification-frameworks.certification-framework.versions.edit.validation-message-error"
          }}
          @validationStatus={{this.validateInput
            @draftVersion.defaultProbabilityToPickChallenge
            "defaultProbabilityToPickChallenge"
          }}
          @value={{@draftVersion.defaultProbabilityToPickChallenge}}
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
            step="any"
            @requiredLabel={{t "common.forms.mandatory"}}
            @subLabel={{this.getInputSubLabel @activeVersion.variationPercent}}
            @errorMessage={{t
              "components.certification-frameworks.certification-framework.versions.edit.validation-message-error"
            }}
            @validationStatus={{this.validateInput @draftVersion.variationPercent "variationPercent"}}
            @value={{@draftVersion.variationPercent}}
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
            @subLabel={{this.getInputSubLabel @activeVersion.defaultCandidateCapacity}}
            @errorMessage={{t
              "components.certification-frameworks.certification-framework.versions.edit.validation-message-error"
            }}
            @validationStatus={{this.validateInput @draftVersion.defaultCandidateCapacity "defaultCandidateCapacity"}}
            @value={{@draftVersion.defaultCandidateCapacity}}
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
            @subLabel={{this.getInputSubLabel @activeVersion.maximumAssessmentLength}}
            @errorMessage={{t
              "components.certification-frameworks.certification-framework.versions.edit.validation-message-error"
            }}
            @validationStatus={{this.validateInput @draftVersion.maximumAssessmentLength "maximumAssessmentLength"}}
            @value={{@draftVersion.maximumAssessmentLength}}
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
            @subLabel={{this.getInputSubLabel @activeVersion.minimumAnswersRequiredForValidation}}
            @errorMessage={{t
              "components.certification-frameworks.certification-framework.versions.edit.validation-message-error"
            }}
            @validationStatus={{this.validateInput
              @draftVersion.minimumAnswersRequiredForValidation
              "minimumAnswersRequiredForValidation"
            }}
            @value={{@draftVersion.minimumAnswersRequiredForValidation}}
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
          @subLabel={{this.getInputSubLabel @activeVersion.challengesBetweenSameCompetence}}
          @errorMessage={{t
            "components.certification-frameworks.certification-framework.versions.edit.validation-message-error"
          }}
          @validationStatus={{this.validateInput
            @draftVersion.challengesBetweenSameCompetence
            "challengesBetweenSameCompetence"
          }}
          @value={{@draftVersion.challengesBetweenSameCompetence}}
          {{on "change" this.updateChallengesBetweenSameCompetence}}
        >
          <:label>{{t
              "components.certification-frameworks.certification-framework.versions.edit.challenges-between-same-competence-label"
            }}</:label>
        </PixInput>

        <PixCheckbox
          @checked={{@draftVersion.limitToOneQuestionPerTube}}
          {{on "change" this.updateLimitToOneQuestionPerTube}}
        >
          <:label>
            {{t
              "components.certification-frameworks.certification-framework.versions.edit.limit-to-one-question-per-tube-label"
            }}
            {{#if @activeVersion}}
              <br />
              <small class="pix-label__sub-label">({{this.getInputSubLabel ""}}
                {{#if @activeVersion.limitToOneQuestionPerTube}}✅ {{t "common.words.yes"}}{{else}}⬜
                  {{t "common.words.no"}}{{/if}})</small>
            {{/if}}
          </:label>
        </PixCheckbox>

        <PixCheckbox
          @checked={{@draftVersion.enablePassageByAllCompetences}}
          {{on "change" this.updateEnablePassageByAllCompetences}}
        >
          <:label>
            {{t
              "components.certification-frameworks.certification-framework.versions.edit.enable-passage-by-all-competences-label"
            }}
            {{#if @activeVersion}}
              <br />
              <small class="pix-label__sub-label">({{this.getInputSubLabel ""}}
                {{#if @activeVersion.enablePassageByAllCompetences}}✅ {{t "common.words.yes"}}{{else}}⬜
                  {{t "common.words.no"}}{{/if}})</small>
            {{/if}}
          </:label>
        </PixCheckbox>
      </form>
    </Card>
    <section class="actions-container">
      <PixButton @type="submit" form="version-edit-form" @isDisabled={{this.disableSubmit}} @variant="secondary">
        {{t "components.certification-frameworks.certification-framework.versions.edit.submit-button"}}
      </PixButton>
      <PixButtonLink @route="authenticated.certification-frameworks.certification-framework" @variant="secondary">
        {{t "common.actions.cancel"}}
      </PixButtonLink>
      <PixButtonLink
        @route="authenticated.certification-frameworks.certification-framework.versions.version.calibration"
        @variant="primary"
      >
        {{t "common.actions.next"}}
      </PixButtonLink>
    </section>
  </template>
}
