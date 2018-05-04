import { computed } from '@ember/object';
import Component from '@ember/component';
import labeledCheckboxes from 'pix-live/utils/labeled-checkboxes';
import valueAsArrayOfBoolean from 'pix-live/utils/value-as-array-of-boolean';
import proposalsAsArray from 'pix-live/utils/proposals-as-array';
import _ from 'pix-live/utils/lodash-custom';

export default Component.extend({
  classNames: ['qcm-solution-panel'],
  answer: null,
  solution: null,
  challenge: null,

  solutionArray: computed('solution', function() {
    const solution = this.get('solution');
    return _.isNonEmptyString(solution) ? valueAsArrayOfBoolean(solution) : [];
  }),

  labeledCheckboxes: computed('answer', function() {
    const answer = this.get('answer.value');
    let checkboxes  = [];
    if (_.isNonEmptyString(answer)) {
      const proposals = this.get('challenge.proposals');
      const proposalsArray = proposalsAsArray(proposals);
      const answerArray = valueAsArrayOfBoolean(answer);
      checkboxes = labeledCheckboxes(proposalsArray, answerArray);
    }
    return checkboxes;
  })
});
