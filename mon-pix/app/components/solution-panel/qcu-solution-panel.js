import Component from '@glimmer/component';
import isEmpty from 'lodash/isEmpty';
import labeledCheckboxes from 'mon-pix/utils/labeled-checkboxes';
import proposalsAsArray from 'mon-pix/utils/proposals-as-array';
import { pshuffle } from 'mon-pix/utils/pshuffle';
import valueAsArrayOfBoolean from 'mon-pix/utils/value-as-array-of-boolean';

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

    return this.labeledRadios.find(({ value }) => value == this.args.solution).label;
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
