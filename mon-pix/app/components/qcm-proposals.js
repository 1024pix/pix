import { action } from '@ember/object';
import Component from '@glimmer/component';
import labeledCheckboxes from 'mon-pix/utils/labeled-checkboxes';
import proposalsAsArray from 'mon-pix/utils/proposals-as-array';
import valueAsArrayOfBoolean from 'mon-pix/utils/value-as-array-of-boolean';

export default class QcmProposals extends Component {
  get labeledCheckboxes() {
    const arrayOfProposals = proposalsAsArray(this.args.proposals);
    const arrayOfBoolean = valueAsArrayOfBoolean(this.args.answerValue);

    return labeledCheckboxes(arrayOfProposals, arrayOfBoolean);
  }

  @action
  checkboxClicked(checkboxName) {
    this.args.answerChanged(checkboxName);
  }
}
