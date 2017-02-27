import Ember from 'ember';
import labeledCheckboxes from 'pix-live/utils/labeled-checkboxes';

const ComparisonWindow = Ember.Component.extend({

  answer: null,
  challenge: null,
  solution: null,
  index: null,

  isAssessmentChallengeTypeQroc: Ember.computed.equal('challenge.type', 'QROC'),
  isAssessmentChallengeTypeQCM: Ember.computed.equal('challenge.type', 'QCM'),
  isAssessmentChallengeTypeQrocm: Ember.computed.equal('challenge.type', 'QROCM'),
  isAssessmentChallengeTypeQrocmInd: Ember.computed.equal('challenge.type', 'QROCM-IND'),
  isAssessmentChallengeTypeQrocmDep: Ember.computed.equal('challenge.type', 'QROCM-DEP'),


  solutionArray: Ember.computed('solution', function() {
    return this.get('solution').get('_valueAsArrayOfBoolean');
  }),

  labeledCheckboxes: Ember.computed('answer', function() {
    return labeledCheckboxes(this.get('challenge').get('_proposalsAsArray'), this.get('answer').get('_valueAsArrayOfBoolean'));
  })

});

ComparisonWindow.reopenClass({
  positionalParams: ['answer','challenge','solution','index']
});

export default ComparisonWindow;
