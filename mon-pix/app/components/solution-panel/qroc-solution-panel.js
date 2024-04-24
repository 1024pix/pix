import { service } from '@ember/service';
import Component from '@glimmer/component';

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

  get isNotCorrectlyAnswered() {
    return this.args.answer.result !== 'ok';
  }

  get inputAriaLabel() {
    switch (this.args.answer.result) {
      case 'ok':
        return this.intl.t('pages.comparison-window.results.a11y.good-answer');
      case 'ko':
        return this.intl.t('pages.comparison-window.results.a11y.wrong-answer');
      default:
        return this.intl.t('pages.comparison-window.results.a11y.skipped-answer');
    }
  }

  get hasCorrection() {
    return this.args.solution || this.args.solutionToDisplay;
  }

  get answerToDisplay() {
    const answer = this.args.answer.value;
    if (answer === '#ABAND#') {
      return this.intl.t('pages.result-item.aband');
    }
    return answer;
  }

  get understandableSolution() {
    if (this.args.solutionToDisplay) {
      return this.args.solutionToDisplay;
    }
    const solutionVariants = this.args.solution;
    if (!solutionVariants) {
      return '';
    }
    return solutionVariants.split('\n')[0];
  }
}
