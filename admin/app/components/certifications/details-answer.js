import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

const options = [
  { value: 'ok', label: 'Succès' },
  { value: 'ko', label: 'Échec' },
  { value: 'partially', label: 'Succès partiel' },
  { value: 'timedout', label: 'Temps écoulé' },
  { value: 'focusedOut', label: 'Focus échoué' },
  { value: 'aband', label: 'Passée' },
  { value: 'skip', label: 'Neutralisée' },
  { value: 'skippedAutomatically', label: 'Abandon' },
];

export default class CertificationDetailsAnswer extends Component {
  @tracked selectedOption = null;
  @tracked hasJuryResult = false;

  constructor() {
    super(...arguments);
    this.resultOptions = options;
    this.selectedOption = this._answerResultValue();
  }

  get resultClass() {
    return this.hasJuryResult ? 'jury' : null;
  }

  get linkToChallengePreviewInPixApp() {
    return `https://app.recette.pix.fr/challenges/${this.args.answer.challengeId}/preview`;
  }

  get linkToChallengeInfoInPixEditor() {
    return `https://editor.pix.fr/#/challenge/${this.args.answer.challengeId}`;
  }

  @action
  selectOption(newResult) {
    const answer = this.args.answer;
    const answerResult = this._answerResultValue();
    answer.jury = answerResult !== newResult ? newResult : null;
    this.selectedOption = newResult ?? answerResult;
    this.hasJuryResult = !!newResult;
    this.args.onUpdateRate();
  }

  _answerResultValue() {
    if (this.args.answer.isNeutralized) {
      return 'skip';
    }
    if (this.args.answer.hasBeenSkippedAutomatically) {
      return 'skippedAutomatically';
    }
    return this.args.answer.result;
  }
}
