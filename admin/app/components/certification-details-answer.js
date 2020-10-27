import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { find } from 'lodash';

const options = [
  { value: 'ok', label: 'Succès' },
  { value: 'ko', label: 'Échec' },
  { value: 'partially', label: 'Succès partiel' },
  { value: 'timedout', label: 'Temps écoulé' },
  { value: 'aband', label: 'Abandon' },
  { value: 'skip', label: 'Neutralisée' },
];

export default class CertificationDetailsAnswer extends Component {

  @tracked selectedOption = null;
  @tracked hasJuryResult = false;

  constructor() {
    super(...arguments);
    this.resultOptions = options;
    this.selectedOption = this.getOption(this.args.answer.result);
  }

  getOption(resultValue) {
    return find(options, { value: resultValue });
  }

  get resultClass() {
    return this.hasJuryResult ? 'answer-result jury' : 'answer-result';
  }

  @action
  selectOption(selected) {
    const answer = this.args.answer;
    const newResult = (selected.value !== answer.result) ? selected.value : null;
    answer.jury = newResult;
    this.selectedOption = newResult ? this.getOption(newResult) : this.getOption(this.args.answer.result);
    this.hasJuryResult = !!newResult;
    this.args.onUpdateRate();
  }
}
