import { action } from '@ember/object';
import Component from '@glimmer/component';
import labeledCheckboxes from 'mon-pix/utils/labeled-checkboxes';
import proposalsAsArray from 'mon-pix/utils/proposals-as-array';
import valueAsArrayOfBoolean from 'mon-pix/utils/value-as-array-of-boolean';
import forEach from 'lodash/forEach';

export default class QcuProposals extends Component {

  get labeledRadios() {
    const arrayOfProposals = proposalsAsArray(this.args.proposals);
    return labeledCheckboxes(arrayOfProposals, valueAsArrayOfBoolean(this.args.answerValue));
  }

  _uncheckAllRadioButtons() {
    forEach(this._formCheckboxes, (element) => {
      element.checked = false;
    });
  }

  _checkAgainTheSelectedOption(index) {
    const selectedOption = this._formCheckboxes[index];
    selectedOption.checked = true;
  }

  @action
  radioClicked(index) {
    this._uncheckAllRadioButtons();
    this._checkAgainTheSelectedOption(index);
    this.args.answerChanged();
  }

  get _formCheckboxes() {
    return document.querySelectorAll('.proposal-paragraph input[type="radio"]');
  }
}
