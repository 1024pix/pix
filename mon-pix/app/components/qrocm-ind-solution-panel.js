import { computed } from '@ember/object';
import { htmlSafe } from '@ember/template';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';
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
    return 'correction-qroc-box-answer--aband';
  }
  if (answerOutcome === 'ok') {
    return 'correction-qroc-box-answer--correct';
  }
  return 'correction-qroc-box-answer--wrong';
}

@classic
class QrocmIndSolutionPanel extends Component {
  @computed('challenge.proposals', 'answer.value', 'solution')
  get inputFields() {

    const escapedProposals = this.challenge.get('proposals').replace(/(\n\n|\n)/gm, '<br>');
    const labels = labelsAsObject(htmlSafe(escapedProposals).string);
    const answers = answersAsObject(this.answer.value, _.keys(labels));
    const solutions = solutionsAsObject(this.solution);
    const resultDetails = resultDetailsAsObject(this.answer.resultDetails);

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
  }
}

export default QrocmIndSolutionPanel;

