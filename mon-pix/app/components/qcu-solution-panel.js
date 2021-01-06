import Component from '@glimmer/component';
import labeledCheckboxes from 'mon-pix/utils/labeled-checkboxes';
import valueAsArrayOfBoolean from 'mon-pix/utils/value-as-array-of-boolean';
import proposalsAsArray from 'mon-pix/utils/proposals-as-array';
import isEmpty from 'lodash/isEmpty';
import ENV from 'mon-pix/config/environment';

export default class QcuSolutionPanel extends Component {
  featureFlagDisplayForWrongAnswers = ENV.APP.FT_IMPROVE_DISPLAY_FOR_WRONG_ANSWERS_FOR_QCU;

  get solutionArray() {
    const solution = this.args.solution;
    return !isEmpty(solution) ? valueAsArrayOfBoolean(solution) : [];
  }

  get solutionAsText() {
    const answersProposedByUser = this.labeledRadios;
    const correctAnswerIndex = this.solutionArray.indexOf(true);
    const solutionAndStatus = answersProposedByUser[correctAnswerIndex];

    return solutionAndStatus[0];
  }

  get labeledRadios() {
    const answer = this.args.answer.value;
    let radiosArray = [];
    if (!isEmpty(answer)) {
      const proposals = this.args.challenge.get('proposals');
      const proposalsArray = proposalsAsArray(proposals);
      const answerArray = valueAsArrayOfBoolean(answer);
      radiosArray = labeledCheckboxes(proposalsArray, answerArray);
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
