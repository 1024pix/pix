import { action } from '@ember/object';
import Component from '@glimmer/component';
import labeledCheckboxes from '1d/utils/labeled-checkboxes';
import proposalsAsArray from '1d/utils/proposals-as-array';
import { pshuffle } from '1d/utils/pshuffle';
import valueAsArrayOfBoolean from '1d/utils/value-as-array-of-boolean';

export default class ChallengeItemQcm extends Component {
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
    } else {
      this.checkedValues.add(checkboxName);
    }
    this.args.setAnswerValue(Array.from(this.checkedValues).join());
  }
}
