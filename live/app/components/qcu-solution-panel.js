import Ember from 'ember';
import labeledCheckboxes from 'pix-live/utils/labeled-checkboxes';
import valueAsArrayOfBoolean from 'pix-live/utils/value-as-array-of-boolean';
import proposalsAsArray from 'pix-live/utils/proposals-as-array';
import _ from 'pix-live/utils/lodash-custom';

export default Ember.Component.extend({
  classNames: ['qcu-solution-panel'],
  answer: null,
  solution: null,
  challenge: null,

  solutionArray: Ember.computed('solution', function() {
    const solution = this.get('solution.value');
    return _.isNonEmptyString(solution) ? valueAsArrayOfBoolean(solution) : [];
  }),

  labeledRadios: Ember.computed('answer', function() {
    const answer = this.get('answer.value');
    let radiosArray = [];
    if (_.isNonEmptyString(answer)) {
      const proposals = this.get('challenge.proposals');
      const proposalsArray = proposalsAsArray(proposals);
      const answerArray = valueAsArrayOfBoolean(answer);
      radiosArray = labeledCheckboxes(proposalsArray, answerArray);
    }

    return radiosArray;
  })
});
