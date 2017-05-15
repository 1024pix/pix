import Ember from 'ember';
import _ from 'lodash';
import answersAsObject from 'pix-live/utils/answers-as-object';
import solutionsAsObject from 'pix-live/utils/solution-as-object';
import labelsAsObject from 'pix-live/utils/labels-as-object';
import resultDetailsAsObject from 'pix-live/utils/result-details-as-object';

function _computeAnswerOutcome(inputFieldValue, resultDetail) {
  if (inputFieldValue === '') {
    return 'empty';
  }
  return resultDetail === true ? 'ok': 'ko';
}

function _computeInputClass(answerOutcome) {
  if (answerOutcome === 'empty') {
    return 'correction-qroc-box__input-no-answer';
  }
  if (answerOutcome === 'ok') {
    return 'correction-qroc-box__input-right-answer';
  }
  return 'correction-qroc-box__input-wrong-answer';
}

const QrocmIndSolutionPanel = Ember.Component.extend({

  inputFields: Ember.computed('challenge.proposals', 'answer.value', 'solution.value', function() {

    const labels = labelsAsObject(this.get('challenge.proposals'));
    const answers = answersAsObject(this.get('answer.value'), _.keys(labels));
    const solutions = solutionsAsObject(this.get('solution.value'));
    const resultDetails = resultDetailsAsObject(this.get('answer.resultDetails'));

    const inputFields = [];

    _.forEach(labels, (label, labelKey) => {
      const answerOutcome = _computeAnswerOutcome(answers[labelKey], resultDetails[labelKey]);
      const inputClass = _computeInputClass(answerOutcome);

      if (answers[labelKey] === '') {
        answers[labelKey] = 'Pas de réponse';
      }
      const inputField = {
        label: labels[labelKey],
        answer: answers[labelKey],
        solution: solutions[labelKey][0],
        emptyOrWrongAnswer: (answerOutcome === 'empty' || answerOutcome === 'ko'),
        inputClass
      };
      inputFields.push(inputField);
    });

    return inputFields;
  })

});

export default QrocmIndSolutionPanel;

