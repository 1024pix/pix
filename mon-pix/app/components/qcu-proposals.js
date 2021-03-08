import { action } from '@ember/object';
import Component from '@glimmer/component';
import labeledCheckboxes from 'mon-pix/utils/labeled-checkboxes';
import proposalsAsArray from 'mon-pix/utils/proposals-as-array';
import valueAsArrayOfBoolean from 'mon-pix/utils/value-as-array-of-boolean';

export default class QcuProposals extends Component {
  get labeledRadios() {
    const arrayOfProposals = proposalsAsArray(this.args.proposals);
    return labeledCheckboxes(arrayOfProposals, valueAsArrayOfBoolean(this.args.answerValue));
  }

  @action
  radioClicked() {
    this.args.answerChanged();
  }

}
