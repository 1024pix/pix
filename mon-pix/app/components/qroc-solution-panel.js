import { computed } from '@ember/object';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';

const classByResultValue = {
  ok: 'correction-qroc-box-answer--correct',
  ko: 'correction-qroc-box-answer--wrong',
  aband: 'correction-qroc-box-answer--aband',
};

@classic
export default class QrocSolutionPanel extends Component {
  answer = null;
  solution = null;

  @computed('answer.result')
  get inputClass() {
    return classByResultValue[this.get('answer.result')] || '';
  }

  @computed('answer')
  get isResultOk() {
    return this.get('answer.result') === 'ok';
  }

  @computed('answer')
  get answerToDisplay() {
    const answer = this.get('answer.value');
    if (answer === '#ABAND#') {
      return 'Pas de réponse';
    }
    return answer;
  }

  @computed('solution')
  get solutionToDisplay() {
    const solutionVariants = this.solution;
    if (!solutionVariants) {
      return '';
    }
    return solutionVariants.split('\n')[0];
  }
}
