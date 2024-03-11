import { service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import keys from 'lodash/keys';
import answersAsObject from 'mon-pix/utils/answers-as-object';
import labelsAsObject from 'mon-pix/utils/labels-as-object';
import proposalsAsBlocks from 'mon-pix/utils/proposals-as-blocks';
import resultDetailsAsObject from 'mon-pix/utils/result-details-as-object';
import solutionsAsObject from 'mon-pix/utils/solution-as-object';

export default class QrocmIndSolutionPanel extends Component {
  @service intl;

  get isNotCorrectlyAnswered() {
    return this.args.answer.result !== 'ok';
  }

  get blocks() {
    if (!this.args.solution) {
      return undefined;
    }
    const escapedProposals = this.args.challenge.get('proposals').replace(/(\n\n|\n)/gm, '<br>');
    const labels = labelsAsObject(htmlSafe(escapedProposals).toString());
    const answers = answersAsObject(this.args.answer.value, keys(labels));
    const solutions = solutionsAsObject(this.args.solution);
    const resultDetails = resultDetailsAsObject(this.args.answer.resultDetails);

    return proposalsAsBlocks(this.args.challenge.get('proposals')).map((block) => {
      block.showText = block.text && !block.ariaLabel && !block.input;
      const blockIsInputOrTextarea = !block.showText && !block.breakline;

      if (blockIsInputOrTextarea) {
        const answerOutcome = this._computeAnswerOutcome(answers[block.input], resultDetails[block.input]);
        const inputClass = this._computeInputClass(answerOutcome);
        const ariaLabel = this._computeAriaLabel(answerOutcome);
        if (answers[block.input] === '') {
          answers[block.input] = this.intl.t('pages.result-item.aband');
        }
        block.ariaLabel = ariaLabel;
        block.inputClass = inputClass;
        block.answer = answers[block.input];
        block.solution = solutions[block.input][0];
        block.emptyOrWrongAnswer = answerOutcome === 'empty' || answerOutcome === 'ko';
      }
      return block;
    });
  }

  _computeAnswerOutcome(inputFieldValue, resultDetail) {
    if (inputFieldValue === '') {
      return 'empty';
    }
    return resultDetail === true ? 'ok' : 'ko';
  }

  _computeInputClass(answerOutcome) {
    if (answerOutcome === 'empty') {
      return 'correction-qroc-box-answer--aband';
    }
    if (answerOutcome === 'ok') {
      return 'correction-qroc-box-answer--correct';
    }
    return 'correction-qroc-box-answer--wrong';
  }

  _computeAriaLabel(answerOutcome) {
    switch (answerOutcome) {
      case 'ok':
        return this.intl.t('pages.comparison-window.results.a11y.good-answer');
      case 'ko':
        return this.intl.t('pages.comparison-window.results.a11y.wrong-answer');
      default:
        return this.intl.t('pages.comparison-window.results.a11y.skipped-answer');
    }
  }
}
