import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

const classByResultValue = {
  ok: 'correction-qroc-box-answer--correct',
  ko: 'correction-qroc-box-answer--wrong',
  aband: 'correction-qroc-box-answer--aband',
};

export default class QrocSolutionPanel extends Component {
  @service intl;

  get inputClass() {
    return classByResultValue[this.args.answer.result] || '';
  }

  get isResultOk() {
    return this.args.answer.result === 'ok';
  }

  get answerToDisplay() {
    const answer = this.args.answer.value;
    if (answer === '#ABAND#') {
      return this.intl.t('pages.result-item.aband');
    }
    return answer;
  }

  get solutionToDisplay() {
    const solutionVariants = this.args.solution;
    if (!solutionVariants) {
      return '';
    }
    return solutionVariants.split('\n')[0];
  }
}
