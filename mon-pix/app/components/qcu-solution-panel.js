import Component from '@glimmer/component';
import labeledCheckboxes from 'mon-pix/utils/labeled-checkboxes';
import { pshuffle } from 'mon-pix/utils/pshuffle';
import valueAsArrayOfBoolean from 'mon-pix/utils/value-as-array-of-boolean';
import proposalsAsArray from 'mon-pix/utils/proposals-as-array';
import isEmpty from 'lodash/isEmpty';

export default class QcuSolutionPanel extends Component {
  get solutionArray() {
    const solution = this.args.solution;
    return !isEmpty(solution) ? valueAsArrayOfBoolean(solution) : [];
  }

  get solutionAsText() {
    if (!this.args.solution) {
      return '';
    }
    if (this.args.solutionToDisplay) {
      return this.args.solutionToDisplay;
    }

    const answersProposedByUser = this.labeledRadios;
    const correctAnswerIndex = this.solutionArray.indexOf(true);
    const solutionAndStatus = answersProposedByUser[correctAnswerIndex];

    return solutionAndStatus.label;
  }

  get labeledRadios() {
    const answer = this.args.answer.value;
    let radiosArray = [];
    if (!isEmpty(answer)) {
      const proposals = this.args.challenge.get('proposals');
      const proposalsArray = proposalsAsArray(proposals);
      const answerArray = valueAsArrayOfBoolean(answer);
      radiosArray = labeledCheckboxes(proposalsArray, answerArray);
      if (this.args.challenge.get('shuffled')) {
        pshuffle(radiosArray, this.args.answer.assessment.get('id'));
      }
    }

    return radiosArray;
  }

  get isAnswerValid() {
    if (!this.args.answer) {
      return false;
    }
    return this.args.solution === this.args.answer.value;
  }
}
