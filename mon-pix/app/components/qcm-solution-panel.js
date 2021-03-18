import Component from '@glimmer/component';
import labeledCheckboxes from 'mon-pix/utils/labeled-checkboxes';
import valueAsArrayOfBoolean from 'mon-pix/utils/value-as-array-of-boolean';
import proposalsAsArray from 'mon-pix/utils/proposals-as-array';
import isEmpty from 'lodash/isEmpty';

export default class QcmSolutionPanel extends Component {

  get solutionArray() {
    const solution = this.args.solution;
    return !isEmpty(solution) ? valueAsArrayOfBoolean(solution) : [];
  }

  get isNotCorrectlyAnswered() {
    return this.args.answer.result !== 'ok';
  }

  get labeledCheckboxes() {
    const answer = this.args.answer.value;
    let checkboxes = [];
    if (!isEmpty(answer)) {
      const proposals = this.args.challenge.get('proposals');
      const proposalsArray = proposalsAsArray(proposals);
      const answerArray = valueAsArrayOfBoolean(answer);
      checkboxes = labeledCheckboxes(proposalsArray, answerArray);
    }
    return checkboxes;
  }
}
