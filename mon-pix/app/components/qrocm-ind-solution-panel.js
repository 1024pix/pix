import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import keys from 'lodash/keys';
import answersAsObject from 'mon-pix/utils/answers-as-object';
import solutionsAsObject from 'mon-pix/utils/solution-as-object';
import labelsAsObject from 'mon-pix/utils/labels-as-object';
import resultDetailsAsObject from 'mon-pix/utils/result-details-as-object';
import { inject as service } from '@ember/service';
import proposalsAsBlocks from 'mon-pix/utils/proposals-as-blocks';

function _computeAnswerOutcome(inputFieldValue, resultDetail) {
  if (inputFieldValue === '') {
    return 'empty';
  }
  return resultDetail === true ? 'ok' : 'ko';
}

function _computeInputClass(answerOutcome) {
  if (answerOutcome === 'empty') {
    return 'correction-qroc-box-answer--aband';
  }
  if (answerOutcome === 'ok') {
    return 'correction-qroc-box-answer--correct';
  }
  return 'correction-qroc-box-answer--wrong';
}

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
    const labels = labelsAsObject(htmlSafe(escapedProposals).string);
    const answers = answersAsObject(this.args.answer.value, keys(labels));
    const solutions = solutionsAsObject(this.args.solution);
    const resultDetails = resultDetailsAsObject(this.args.answer.resultDetails);

    return proposalsAsBlocks(this.args.challenge.get('proposals'))
      .map((block) => {
        block.showText = block.text && !block.ariaLabel && !block.input;
        const blockIsInputOrTextarea = !block.showText && !block.breakline;

        if (blockIsInputOrTextarea) {
          const answerOutcome = _computeAnswerOutcome(answers[block.input], resultDetails[block.input]);
          const inputClass = _computeInputClass(answerOutcome);
          if (answers[block.input] === '') {
            answers[block.input] = this.intl.t('pages.result-item.aband');
          }
          block.inputClass = inputClass;
          block.answer = answers[block.input];
          block.solution = solutions[block.input][0];
          block.emptyOrWrongAnswer = (answerOutcome === 'empty' || answerOutcome === 'ko');
        }
        return block;
      });
  }
}

