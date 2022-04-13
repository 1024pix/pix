import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import find from 'lodash/find';

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

  getOption(resultValue) {
    return find(options, { value: resultValue });
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
  selectOption(event) {
    const answer = this.args.answer;
    const answerResult = this._answerResultValue();
    const newResult = this.getOption(event.target.value);
    answer.jury = answerResult.value !== newResult.value ? newResult.value : null;
    this.selectedOption = newResult ?? answerResult;
    this.hasJuryResult = !!newResult;
    this.args.onUpdateRate();
  }

  _answerResultValue() {
    if (this.args.answer.isNeutralized) {
      return this.getOption('skip');
    }
    if (this.args.answer.hasBeenSkippedAutomatically) {
      return this.getOption('skippedAutomatically');
    }
    return this.getOption(this.args.answer.result);
  }
}
