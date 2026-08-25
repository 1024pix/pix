import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { not } from 'ember-truth-helpers';
import Card from 'pix-admin/components/card';
import formatDateToStandard from 'pix-admin/utils/date';

export default class CertificationVersionEditForm extends Component {
  @service store;
  @service router;
  @service intl;
  @service pixToast;

  @tracked _touchedFields = new Set();

  formatAssessmentDuration(assessmentDuration) {
    if (assessmentDuration === null || assessmentDuration === undefined) return null;
    return `${String(Math.floor(assessmentDuration / 60)).padStart(2, '0')}:${String(assessmentDuration % 60).padStart(2, '0')}`;
  }

  formatStartDate(startDate) {
    return startDate ? formatDateToStandard(startDate) : null;
  }

  _isInvalid(value) {
    return value === null || value === undefined || value === 'Invalid Date' || Number.isNaN(value);
  }

  @action
  validationStatusFor(key, value) {
    if (!this._touchedFields.has(key)) return 'default';
    return this._isInvalid(value) ? 'error' : 'default';
  }

  get isFormValid() {
    const v = this.args.draftVersion;
    return [
      this.formatStartDate(v?.startDate),
      this.formatAssessmentDuration(v?.assessmentDuration),
      v?.defaultProbabilityToPickChallenge,
      v?.variationPercent,
      v?.defaultCandidateCapacity,
      v?.maximumAssessmentLength,
      v?.minimumAnswersRequiredForValidation,
      v?.challengesBetweenSameCompetence,
    ].every((val) => !this._isInvalid(val));
  }

  @action
  getInputSubLabel(activeVersionValue) {
    if (activeVersionValue === null || activeVersionValue === undefined) return null;
    return this.intl.t('components.certification-frameworks.certification-framework.versions.edit.sublabel', {
      value: activeVersionValue,
    });
  }

  @action
  onBlur(event) {
    const key = event.target.name;
    if (key) {
      this._touchedFields = new Set([...this._touchedFields, key]);
    }
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
  updateNumberField(event) {
    this.args.draftVersion[event.target.name] = event.target.valueAsNumber;
  }

  @action
  updateLimitToOneQuestionPerTube() {
    this.args.draftVersion.limitToOneQuestionPerTube = !this.args.draftVersion.limitToOneQuestionPerTube;
  }

  @action
  updateEnablePassageByAllCompetences() {
    this.args.draftVersion.enablePassageByAllCompetences = !this.args.draftVersion.enablePassageByAllCompetences;
  }

  async _persistVersion() {
    if (!this.args.draftVersion.hasDirtyAttributes) return;
    await this.args.draftVersion.save();
    this.pixToast.sendSuccessNotification({
      message: this.intl.t(
        'components.certification-frameworks.certification-framework.versions.edit.success-notification',
      ),
    });
  }

  @action
  async saveForLater() {
    if (!this.isFormValid) return;
    try {
      await this._persistVersion();
      await this.store.findRecord('certification-framework', this.args.activeVersion.scope);
      this.router.transitionTo('authenticated.certification-frameworks.certification-framework');
    } catch (err) {
      this.pixToast.sendErrorNotification({ message: err.errors?.[0].detail });
    }
  }

  @action
  async saveAndNext() {
    if (!this.isFormValid) return;
    try {
      await this._persistVersion();
      this.router.transitionTo(
        'authenticated.certification-frameworks.certification-framework.versions.version.calibration',
        this.args.draftVersion.id,
      );
    } catch (err) {
      this.pixToast.sendErrorNotification({ message: err.errors?.[0].detail });
    }
  }

  <template>
    <Card @title={{t "components.certification-frameworks.certification-framework.versions.edit.title"}}>
      <form class="versions-edit__form">
        <PixInput
          name="startDate"
          type="date"
          required={{true}}
          @requiredLabel={{t "common.forms.mandatory"}}
          @subLabel={{this.getInputSubLabel (this.formatStartDate @activeVersion.startDate)}}
          @value={{this.formatStartDate @draftVersion.startDate}}
          @errorMessage={{t
            "components.certification-frameworks.certification-framework.versions.edit.validation-message-error"
          }}
          @validationStatus={{this.validationStatusFor "startDate" (this.formatStartDate @draftVersion.startDate)}}
          {{on "change" this.updateStartDate}}
          {{on "focusout" this.onBlur}}
        >
          <:label>
            {{t "components.certification-frameworks.certification-framework.versions.edit.start-date-label"}}</:label>
        </PixInput>
        <PixInput
          name="assessmentDuration"
          type="time"
          required={{true}}
          @requiredLabel={{t "common.forms.mandatory"}}
          @subLabel={{this.getInputSubLabel (this.formatAssessmentDuration @activeVersion.assessmentDuration)}}
          @errorMessage={{t
            "components.certification-frameworks.certification-framework.versions.edit.validation-message-error"
          }}
          @validationStatus={{this.validationStatusFor
            "assessmentDuration"
            (this.formatAssessmentDuration @draftVersion.assessmentDuration)
          }}
          @value={{this.formatAssessmentDuration @draftVersion.assessmentDuration}}
          {{on "change" this.updateAssessmentDuration}}
          {{on "focusout" this.onBlur}}
        >
          <:label>{{t
              "components.certification-frameworks.certification-framework.versions.edit.assessment-duration-label"
            }}</:label>
        </PixInput>
        <PixInput
          name="defaultProbabilityToPickChallenge"
          type="number"
          required={{true}}
          @requiredLabel={{t "common.forms.mandatory"}}
          @subLabel={{this.getInputSubLabel @activeVersion.defaultProbabilityToPickChallenge}}
          @errorMessage={{t
            "components.certification-frameworks.certification-framework.versions.edit.validation-message-error"
          }}
          @validationStatus={{this.validationStatusFor
            "defaultProbabilityToPickChallenge"
            @draftVersion.defaultProbabilityToPickChallenge
          }}
          @value={{@draftVersion.defaultProbabilityToPickChallenge}}
          {{on "change" this.updateNumberField}}
          {{on "focusout" this.onBlur}}
        >
          <:label>{{t
              "components.certification-frameworks.certification-framework.versions.edit.default-probability-to-pick-challenge-label"
            }}</:label>
        </PixInput>
        <section>
          <PixInput
            name="variationPercent"
            type="number"
            required={{true}}
            step="any"
            @requiredLabel={{t "common.forms.mandatory"}}
            @subLabel={{this.getInputSubLabel @activeVersion.variationPercent}}
            @errorMessage={{t
              "components.certification-frameworks.certification-framework.versions.edit.validation-message-error"
            }}
            @validationStatus={{this.validationStatusFor "variationPercent" @draftVersion.variationPercent}}
            @value={{@draftVersion.variationPercent}}
            {{on "change" this.updateNumberField}}
            {{on "focusout" this.onBlur}}
          >
            <:label>{{t
                "components.certification-frameworks.certification-framework.versions.edit.variation-percent-label"
              }}</:label>
          </PixInput>
          <PixInput
            name="defaultCandidateCapacity"
            type="number"
            required={{true}}
            @requiredLabel={{t "common.forms.mandatory"}}
            @subLabel={{this.getInputSubLabel @activeVersion.defaultCandidateCapacity}}
            @errorMessage={{t
              "components.certification-frameworks.certification-framework.versions.edit.validation-message-error"
            }}
            @validationStatus={{this.validationStatusFor
              "defaultCandidateCapacity"
              @draftVersion.defaultCandidateCapacity
            }}
            @value={{@draftVersion.defaultCandidateCapacity}}
            {{on "change" this.updateNumberField}}
            {{on "focusout" this.onBlur}}
          >
            <:label>{{t
                "components.certification-frameworks.certification-framework.versions.edit.default-candidate-capacity-label"
              }}</:label>
          </PixInput>
        </section>
        <section>
          <PixInput
            name="maximumAssessmentLength"
            type="number"
            required={{true}}
            @requiredLabel={{t "common.forms.mandatory"}}
            @subLabel={{this.getInputSubLabel @activeVersion.maximumAssessmentLength}}
            @errorMessage={{t
              "components.certification-frameworks.certification-framework.versions.edit.validation-message-error"
            }}
            @validationStatus={{this.validationStatusFor
              "maximumAssessmentLength"
              @draftVersion.maximumAssessmentLength
            }}
            @value={{@draftVersion.maximumAssessmentLength}}
            {{on "change" this.updateNumberField}}
            {{on "focusout" this.onBlur}}
          >
            <:label>{{t
                "components.certification-frameworks.certification-framework.versions.edit.maximum-assessment-length-label"
              }}</:label>
          </PixInput>
          <PixInput
            name="minimumAnswersRequiredForValidation"
            type="number"
            required={{true}}
            @requiredLabel={{t "common.forms.mandatory"}}
            @subLabel={{this.getInputSubLabel @activeVersion.minimumAnswersRequiredForValidation}}
            @errorMessage={{t
              "components.certification-frameworks.certification-framework.versions.edit.validation-message-error"
            }}
            @validationStatus={{this.validationStatusFor
              "minimumAnswersRequiredForValidation"
              @draftVersion.minimumAnswersRequiredForValidation
            }}
            @value={{@draftVersion.minimumAnswersRequiredForValidation}}
            {{on "change" this.updateNumberField}}
            {{on "focusout" this.onBlur}}
          >
            <:label>{{t
                "components.certification-frameworks.certification-framework.versions.edit.minimum-answers-required-for-validation-label"
              }}</:label>
          </PixInput>
        </section>
        <PixInput
          name="challengesBetweenSameCompetence"
          type="number"
          required={{true}}
          @requiredLabel={{t "common.forms.mandatory"}}
          @subLabel={{this.getInputSubLabel @activeVersion.challengesBetweenSameCompetence}}
          @errorMessage={{t
            "components.certification-frameworks.certification-framework.versions.edit.validation-message-error"
          }}
          @validationStatus={{this.validationStatusFor
            "challengesBetweenSameCompetence"
            @draftVersion.challengesBetweenSameCompetence
          }}
          @value={{@draftVersion.challengesBetweenSameCompetence}}
          {{on "change" this.updateNumberField}}
          {{on "focusout" this.onBlur}}
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
      <PixButton @isDisabled={{not this.isFormValid}} @variant="secondary" @triggerAction={{this.saveForLater}}>
        {{t "components.certification-frameworks.certification-framework.versions.edit.submit-button"}}
      </PixButton>
      <PixButtonLink @route="authenticated.certification-frameworks.certification-framework" @variant="secondary">
        {{t "common.actions.cancel"}}
      </PixButtonLink>
      <PixButton @isDisabled={{not this.isFormValid}} @variant="primary" @triggerAction={{this.saveAndNext}}>
        {{t "common.actions.next"}}
      </PixButton>
    </section>
  </template>
}
