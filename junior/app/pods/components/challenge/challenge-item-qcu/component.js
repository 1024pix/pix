import { action } from '@ember/object';
import Component from '@glimmer/component';
import labeledCheckboxes from 'junior/utils/labeled-checkboxes';
import proposalsAsArray from 'junior/utils/proposals-as-array';
import { pshuffle } from 'junior/utils/pshuffle';
import valueAsArrayOfBoolean from 'junior/utils/value-as-array-of-boolean';

export default class QcuProposals extends Component {
  get labeledRadios() {
    const arrayOfProposals = proposalsAsArray(this.args.challenge.proposals);
    const labeledCheckboxesList = labeledCheckboxes(arrayOfProposals, valueAsArrayOfBoolean());
    if (this.args.challenge.shuffled) {
      pshuffle(labeledCheckboxesList, this.args.assessment?.id);
    }
    return labeledCheckboxesList;
  }

  @action
  radioClicked() {
    const checkedInputValues = [];
    const radioInputElements = document.querySelectorAll('input[type="radio"]:checked');
    Array.prototype.forEach.call(radioInputElements, function (element) {
      checkedInputValues.push(element.getAttribute('data-value'));
    });
    this.args.setAnswerValue(checkedInputValues.join(''));
  }
}
