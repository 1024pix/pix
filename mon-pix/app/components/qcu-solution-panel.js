import { classNames } from '@ember-decorators/component';
import { computed } from '@ember/object';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';
import labeledCheckboxes from 'mon-pix/utils/labeled-checkboxes';
import valueAsArrayOfBoolean from 'mon-pix/utils/value-as-array-of-boolean';
import proposalsAsArray from 'mon-pix/utils/proposals-as-array';
import _ from 'mon-pix/utils/lodash-custom';

@classic
@classNames('qcu-solution-panel')
export default class QcuSolutionPanel extends Component {
  answer = null;
  solution = null;
  challenge = null;

  @computed('solution')
  get solutionArray() {
    const solution = this.solution;
    return _.isNonEmptyString(solution) ? valueAsArrayOfBoolean(solution) : [];
  }

  @computed('answer')
  get labeledRadios() {
    const answer = this.get('answer.value');
    let radiosArray = [];
    if (_.isNonEmptyString(answer)) {
      const proposals = this.get('challenge.proposals');
      const proposalsArray = proposalsAsArray(proposals);
      const answerArray = valueAsArrayOfBoolean(answer);
      radiosArray = labeledCheckboxes(proposalsArray, answerArray);
    }

    return radiosArray;
  }
}
