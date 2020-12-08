/* eslint ember/no-classic-components: 0 */
/* eslint ember/require-computed-property-dependencies: 0 */
/* eslint ember/require-tagless-components: 0 */

import { classNames } from '@ember-decorators/component';
import { computed } from '@ember/object';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';
import labeledCheckboxes from 'mon-pix/utils/labeled-checkboxes';
import valueAsArrayOfBoolean from 'mon-pix/utils/value-as-array-of-boolean';
import proposalsAsArray from 'mon-pix/utils/proposals-as-array';
import isEmpty from 'lodash/isEmpty';
import ENV from 'mon-pix/config/environment';

@classic
@classNames('qcu-solution-panel')
export default class QcuSolutionPanel extends Component {
  answer = null;
  solution = null;
  challenge = null;
  featureFlagDisplayForWrongAnswers = ENV.APP.FT_IMPROVE_DISPLAY_FOR_WRONG_ANSWERS_FOR_QCU;

  @computed('solution')
  get solutionArray() {
    const solution = this.solution;
    return !isEmpty(solution) ? valueAsArrayOfBoolean(solution) : [];
  }

  get solutionAsText() {
    const answersProposedByUser = this.labeledRadios;
    const correctAnswerIndex = this.solutionArray.indexOf(true);
    const solutionAndStatus = answersProposedByUser[correctAnswerIndex];

    return solutionAndStatus[0];
  }

  @computed('answer')
  get labeledRadios() {
    const answer = this.answer.value;
    let radiosArray = [];
    if (!isEmpty(answer)) {
      const proposals = this.challenge.get('proposals');
      const proposalsArray = proposalsAsArray(proposals);
      const answerArray = valueAsArrayOfBoolean(answer);
      radiosArray = labeledCheckboxes(proposalsArray, answerArray);
    }

    return radiosArray;
  }

  get isAnswerValid() {
    if (!this.answer) {
      return false;
    }
    return this.solution === this.answer.value;
  }
}
