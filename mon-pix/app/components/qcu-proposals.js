import { action } from '@ember/object';
import Component from '@glimmer/component';
import labeledCheckboxes from 'mon-pix/utils/labeled-checkboxes';
import proposalsAsArray from 'mon-pix/utils/proposals-as-array';
import { pshuffle } from 'mon-pix/utils/pshuffle';
import valueAsArrayOfBoolean from 'mon-pix/utils/value-as-array-of-boolean';

export default class QcuProposals extends Component {
  get labeledRadios() {
    const arrayOfProposals = proposalsAsArray(this.args.proposals);
    const labeledCheckboxesList = labeledCheckboxes(arrayOfProposals, valueAsArrayOfBoolean(this.args.answerValue));
    if (this.args.shuffled) {
      pshuffle(labeledCheckboxesList, this.args.shuffleSeed);
    }
    return labeledCheckboxesList;
  }

  @action
  radioClicked() {
    this.args.answerChanged();
  }
}
