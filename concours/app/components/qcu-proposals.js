import { action, computed } from '@ember/object';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';
import labeledCheckboxes from 'mon-pix/utils/labeled-checkboxes';
import proposalsAsArray from 'mon-pix/utils/proposals-as-array';
import valueAsArrayOfBoolean from 'mon-pix/utils/value-as-array-of-boolean';

@classic
export default class QcuProposals extends Component {
  answerValue = null;
  proposals = null;
  answerChanged = null; // action

  @computed('proposals', 'answerValue')
  get labeledRadios() {
    const arrayOfProposals = proposalsAsArray(this.proposals);
    return labeledCheckboxes(arrayOfProposals, valueAsArrayOfBoolean(this.answerValue));
  }

  _uncheckAllRadioButtons() {
    this.$(':radio').prop('checked', false);
  }

  _checkAgainTheSelectedOption(index) {
    this.$(`:radio:nth(${index})`).prop('checked', true);
  }

  @action
  radioClicked(index) {
    this._uncheckAllRadioButtons();
    this._checkAgainTheSelectedOption(index);
    this.answerChanged();
  }
}
