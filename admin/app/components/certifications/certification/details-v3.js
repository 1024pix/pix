import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { subcategoryToCode, subcategoryToLabel } from '../../../models/certification-issue-report';
import { abortReasons, assessmentStates } from '../../../models/v3-certification-course-details-for-administration';

const options = [
  { value: 'ok', label: 'OK', color: 'success' },
  { value: 'ko', label: 'KO', color: 'neutral' },
  { value: null, label: 'Signalement validé', color: 'error' },
  { value: 'aband', label: 'Abandonnée', color: 'tertiary' },
];

const assessmentStateMap = {
  [assessmentStates.ENDED_BY_SUPERVISOR]: {
    label: 'Le surveillant',
    color: 'secondary',
  },
  [assessmentStates.ENDED_DUE_TO_FINALIZATION]: {
    label: 'Finalisation session',
    color: 'tertiary',
  },
};

const abortReasonMap = {
  [abortReasons.CANDIDATE]: 'Abandon : Manque de temps ou départ prématuré',
  [abortReasons.TECHNICAL]: 'Problème technique',
};

const statusList = [
  {
    value: 'validated',
    label: 'Validée',
    color: 'success',
  },
  {
    value: 'rejected',
    label: 'Rejetée',
    color: 'error',
  },
  {
    value: 'error',
    label: 'Erreur',
    color: 'error',
  },
];

const statusCancelled = {
  label: 'Annulée',
  color: 'error',
};

const statusRejectedForFraud = {
  label: 'Rejetée pour fraude',
  color: 'error',
};

export default class DetailsV3 extends Component {
  @tracked showModal = false;
  @tracked certificationChallenge = null;
  @tracked modalTitle = null;
  @tracked modalContent = null;
  @tracked subCategory = null;

  twentyFourHoursInMs = 24 * 60 * 60 * 1000;

  answerStatusLabel(status) {
    return options.find((option) => option.value === status).label;
  }

  answerStatusColor(status) {
    return options.find((option) => option.value === status).color;
  }

  get detailStatusLabel() {
    const { assessmentResultStatus, isCancelled, isRejectedForFraud } = this.args.details;
    if (isCancelled) {
      return statusCancelled.label;
    }
    if (isRejectedForFraud) {
      return statusRejectedForFraud.label;
    }

    return statusList.find((s) => s.value === assessmentResultStatus).label;
  }

  get detailStatusColor() {
    const { assessmentResultStatus, isCancelled, isRejectedForFraud } = this.args.details;
    if (isCancelled) {
      return statusCancelled.color;
    }
    if (isRejectedForFraud) {
      return statusRejectedForFraud.color;
    }

    return statusList.find((s) => s.value === assessmentResultStatus).color;
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
    return this.args.details.hasExceededTimeLimit ? 'error' : 'success';
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
    this.modalTitle = this._isReportedQuestion() ? 'Signalement' : 'Réponse';
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
