import { computed } from '@ember/object';
import Component from '@ember/component';
import _ from 'lodash';
import answersAsObject from 'mon-pix/utils/answers-as-object';
import solutionsAsObject from 'mon-pix/utils/solution-as-object';
import labelsAsObject from 'mon-pix/utils/labels-as-object';
import resultDetailsAsObject from 'mon-pix/utils/result-details-as-object';

function _computeAnswerOutcome(inputFieldValue, resultDetail) {
  if (inputFieldValue === '') {
    return 'empty';
  }
  return resultDetail === true ? 'ok' : 'ko';
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

const QrocmIndSolutionPanel = Component.extend({

  inputFields: computed('challenge.proposals', 'answer.value', 'solution', function() {

    const labels = labelsAsObject(this.get('challenge.proposals'));
    const answers = answersAsObject(this.get('answer.value'), _.keys(labels));
    const solutions = solutionsAsObject(this.solution);
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

