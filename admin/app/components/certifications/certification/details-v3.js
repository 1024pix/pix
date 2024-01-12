import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { subcategoryToCode, subcategoryToLabel } from '../../../models/certification-issue-report';
import { abortReasons, assessmentStates } from '../../../models/v3-certification-course-details-for-administration';

const successColor = 'success';
const errorColor = 'error';
const neutralColor = 'neutral';
const secondaryColor = 'secondary';
const tertiaryColor = 'tertiary';

const abortReasonMap = {
  [abortReasons.CANDIDATE]: 'pages.certifications.certification.details.v3.abort-reason.candidate',
  [abortReasons.TECHNICAL]: 'pages.certifications.certification.details.v3.abort-reason.technical',
};

const answerStatusMap = [
  { value: 'ok', label: 'pages.certifications.certification.details.v3.answer-status.ok', color: successColor },
  { value: 'ko', label: 'pages.certifications.certification.details.v3.answer-status.ko', color: neutralColor },
  {
    value: null,
    label: 'pages.certifications.certification.details.v3.answer-status.validated-live-alert',
    color: errorColor,
  },
  { value: 'aband', label: 'pages.certifications.certification.details.v3.answer-status.aband', color: tertiaryColor },
];

const assessmentResultStatusLabelAndColor = (status) => ({
  label: `pages.certifications.certification.details.v3.assessment-result-status.${status}`,
  color: status === 'validated' ? successColor : errorColor,
});

const assessmentStateMap = {
  [assessmentStates.ENDED_BY_SUPERVISOR]: {
    label: 'pages.certifications.certification.details.v3.assessment-state.ended-by-supervisor',
    color: secondaryColor,
  },
  [assessmentStates.ENDED_DUE_TO_FINALIZATION]: {
    label: 'pages.certifications.certification.details.v3.assessment-state.ended-due-to-finalization',
    color: tertiaryColor,
  },
};

export default class DetailsV3 extends Component {
  @tracked showModal = false;
  @tracked certificationChallenge = null;
  @tracked modalTitle = 'pages.certifications.certification.details.v3.live-alert-modal.title.report';
  @tracked modalContent = null;
  @tracked subCategory = null;

  twentyFourHoursInMs = 24 * 60 * 60 * 1000;

  answerStatusLabel(status) {
    return answerStatusMap.find((option) => option.value === status).label;
  }

  answerStatusColor(status) {
    return answerStatusMap.find((option) => option.value === status).color;
  }

  get detailStatusLabel() {
    const { assessmentResultStatus, isCancelled, isRejectedForFraud } = this.args.details;
    if (isCancelled) {
      return assessmentResultStatusLabelAndColor('cancelled').label;
    }
    if (isRejectedForFraud) {
      return assessmentResultStatusLabelAndColor('fraud').label;
    }
    return assessmentResultStatusLabelAndColor(assessmentResultStatus).label;
  }

  get detailStatusColor() {
    const { assessmentResultStatus, isCancelled, isRejectedForFraud } = this.args.details;
    if (isCancelled) {
      return assessmentResultStatusLabelAndColor('cancelled').color;
    }
    if (isRejectedForFraud) {
      return assessmentResultStatusLabelAndColor('fraud').color;
    }

    return assessmentResultStatusLabelAndColor(assessmentResultStatus).color;
  }

  shouldDisplayAnswerStatus(certificationChallenge) {
    return !!certificationChallenge.validatedLiveAlert || !!certificationChallenge.answeredAt;
  }

  shouldDisplayAnswerValueIcon(certificationChallenge) {
    return (
      certificationChallenge.answerStatus !== 'aband' &&
      certificationChallenge.answerStatus !== null &&
      !certificationChallenge.validatedLiveAlert
    );
  }

  externalUrlForPreviewChallenge(challengeId) {
    return `https://app.pix.fr/challenges/${challengeId}/preview`;
  }

  externalUrlForPixEditor(challengeId) {
    return `https://editor.pix.fr/challenge/${challengeId}`;
  }

  get durationTagColor() {
    return this.args.details.hasExceededTimeLimit ? errorColor : successColor;
  }

  get shouldDisplayEndedByBlock() {
    return this.hasNotBeenCompletedByCandidate;
  }

  get endedByLabel() {
    return assessmentStateMap[this.args.details.assessmentState].label;
  }

  get certificationEndedByTagColor() {
    return assessmentStateMap[this.args.details.assessmentState].color;
  }

  get abortReasonLabel() {
    return abortReasonMap[this.args.details.abortReason];
  }

  @action
  openModal(certificationChallenge) {
    this.showModal = true;
    this.certificationChallenge = certificationChallenge;
    this.modalTitle = `pages.certifications.certification.details.v3.live-alert-modal.title.${
      this._isReportedQuestion() ? 'report' : 'answer'
    }`;
    this.modalContent = this._isReportedQuestion()
      ? subcategoryToLabel[this.certificationChallenge.validatedLiveAlert.issueReportSubcategory]
      : this.certificationChallenge.answerValue;
    this.subCategory = subcategoryToCode[this.certificationChallenge.validatedLiveAlert.issueReportSubcategory];
  }

  @action
  closeModal() {
    this.showModal = false;
  }

  _isReportedQuestion() {
    return this.certificationChallenge.validatedLiveAlert;
  }
}
