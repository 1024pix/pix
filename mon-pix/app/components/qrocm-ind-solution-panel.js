import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import forEach from 'lodash/forEach';
import keys from 'lodash/keys';
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
    return 'correction-qroc-box-answer--aband';
  }
  if (answerOutcome === 'ok') {
    return 'correction-qroc-box-answer--correct';
  }
  return 'correction-qroc-box-answer--wrong';
}

export default class QrocmIndSolutionPanel extends Component {
  get inputFields() {
    if (!this.args.solution) {
      return undefined;
    }
    const escapedProposals = this.args.challenge.get('proposals').replace(/(\n\n|\n)/gm, '<br>');
    const labels = labelsAsObject(htmlSafe(escapedProposals).string);
    const answers = answersAsObject(this.args.answer.value, keys(labels));
    const solutions = solutionsAsObject(this.args.solution);
    const resultDetails = resultDetailsAsObject(this.args.answer.resultDetails);

    const inputFields = [];

    forEach(labels, (label, labelKey) => {
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
        inputClass,
      };
      inputFields.push(inputField);
    });

    return inputFields;
  }
}

