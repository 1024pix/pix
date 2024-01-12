import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { subcategoryToCode, subcategoryToLabel } from '../../../models/certification-issue-report';

const options = [
  { value: 'ok', label: 'OK', color: 'success' },
  { value: 'ko', label: 'KO', color: 'neutral' },
  { value: null, label: 'Signalement validé', color: 'error' },
  { value: 'aband', label: 'Abandonnée', color: 'tertiary' },
];
export default class DetailsV3 extends Component {
  @tracked showModal = false;
  @tracked certificationChallenge = null;
  @tracked modalTitle = null;
  @tracked modalContent = null;
  @tracked subCategory = null;

  answerStatusLabel(status) {
    return options.find((option) => option.value === status).label;
  }

  answerStatusColor(status) {
    return options.find((option) => option.value === status).color;
  }

  shouldDisplayAnswerStatus(certificationChallenge) {
    return certificationChallenge.validatedLiveAlert || certificationChallenge.answeredAt;
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
