import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import labeledCheckboxes from 'junior/utils/labeled-checkboxes';
import proposalsAsArray from 'junior/utils/proposals-as-array';
import { pshuffle } from 'junior/utils/pshuffle';
import valueAsArrayOfBoolean from 'junior/utils/value-as-array-of-boolean';

export default class ChallengeItemQcm extends Component {
  @service intl;
  checkedValues = new Set();

  get labeledCheckboxes() {
    const arrayOfProposals = proposalsAsArray(this.args.challenge.proposals);
    const arrayOfBoolean = valueAsArrayOfBoolean();
    const labeledCheckboxesList = labeledCheckboxes(arrayOfProposals, arrayOfBoolean);
    if (this.args.challenge.shuffled) {
      pshuffle(labeledCheckboxesList, this.args.assessment?.id);
    }
    this.checkedValues.clear();
    return labeledCheckboxesList;
  }

  @action
  checkboxClicked(checkboxName) {
    if (this.checkedValues.has(checkboxName)) {
      this.checkedValues.delete(checkboxName);
      document.getElementsByName(checkboxName)[0].parentNode.classList.remove('pix-label--checked');
    } else {
      this.checkedValues.add(checkboxName);
      document.getElementsByName(checkboxName)[0].parentNode.classList.add('pix-label--checked');
    }
    this.args.setAnswerValue(Array.from(this.checkedValues).join());
    this._checkValidations();
  }

  _checkValidations() {
    if (this._hasLessThanTwoValues()) {
      this.args.setValidationWarning(this.intl.t('pages.challenge.qcm-error'));
    } else {
      this.args.setValidationWarning(null);
    }
  }

  _hasLessThanTwoValues() {
    return Array.from(this.checkedValues).length < 2;
  }
}
