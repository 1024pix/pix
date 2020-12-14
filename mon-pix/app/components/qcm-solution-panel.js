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

@classic
@classNames('qcm-solution-panel')
export default class QcmSolutionPanel extends Component {
  answer = null;
  solution = null;
  challenge = null;

  @computed('solution')
  get solutionArray() {
    const solution = this.solution;
    return !isEmpty(solution) ? valueAsArrayOfBoolean(solution) : [];
  }

  @computed('answer')
  get labeledCheckboxes() {
    const answer = this.answer.value;
    let checkboxes = [];
    if (!isEmpty(answer)) {
      const proposals = this.challenge.get('proposals');
      const proposalsArray = proposalsAsArray(proposals);
      const answerArray = valueAsArrayOfBoolean(answer);
      checkboxes = labeledCheckboxes(proposalsArray, answerArray);
    }
    return checkboxes;
  }
}
