import Component from '@glimmer/component';
import isEmpty from 'lodash/isEmpty';
import labeledCheckboxes from 'mon-pix/utils/labeled-checkboxes';
import proposalsAsArray from 'mon-pix/utils/proposals-as-array';
import { pshuffle } from 'mon-pix/utils/pshuffle';
import valueAsArrayOfBoolean from 'mon-pix/utils/value-as-array-of-boolean';

export default class QcmSolutionPanel extends Component {
  get solutionArray() {
    const solution = this.args.solution;
    const solutionArray = !isEmpty(solution) ? valueAsArrayOfBoolean(solution, this._proposalsArray.length) : [];
    if (this.args.challenge.get('shuffled')) {
      pshuffle(solutionArray, this.args.answer.assessment.get('id'));
    }
    return solutionArray;
  }

  get isNotCorrectlyAnswered() {
    return this.args.answer.result !== 'ok';
  }

  get labeledCheckboxes() {
    const answer = this.args.answer.value;
    let checkboxes = [];
    if (!isEmpty(answer)) {
      const answerArray = valueAsArrayOfBoolean(answer);
      checkboxes = labeledCheckboxes(this._proposalsArray, answerArray);
      if (this.args.challenge.get('shuffled')) {
        pshuffle(checkboxes, this.args.answer.assessment.get('id'));
      }
    }
    return checkboxes;
  }

  get _proposalsArray() {
    const proposals = this.args.challenge.get('proposals');
    return proposalsAsArray(proposals);
  }
}
