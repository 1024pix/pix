import Component from '@glimmer/component';
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
  { value: 'in progress', label: 'En cours' },
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

  get resultLabel() {
    return this.resultOptions.find((option) => option.value === this.selectedOption).label;
  }

  get linkToChallengeInfoInPixEditor() {
    return `https://editor.pix.fr/#/challenge/${this.args.answer.challengeId}`;
  }

  _answerResultValue() {
    if (this.args.answer.isNeutralized) {
      return 'skip';
    }
    if (this.args.answer.hasBeenSkippedAutomatically) {
      return 'skippedAutomatically';
    }
    return this.args.answer.result ?? 'in progress';
  }
}
