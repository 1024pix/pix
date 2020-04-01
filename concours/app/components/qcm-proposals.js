import { classNames } from '@ember-decorators/component';
import { action, computed } from '@ember/object';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';
import createProposalAnswerTuples from 'mon-pix/utils/labeled-checkboxes';
import proposalsAsArray from 'mon-pix/utils/proposals-as-array';
import valueAsArrayOfBoolean from 'mon-pix/utils/value-as-array-of-boolean';

@classic
@classNames('qcm-proposals')
export default class QcmProposals extends Component {
  answerValue = null;
  proposals = null;
  answerChanged = null;

  @computed('proposals', 'answerValue')
  get labeledCheckboxes() {
    const arrayOfProposals = proposalsAsArray(this.proposals);
    const arrayOfBoolean = valueAsArrayOfBoolean(this.answerValue);

    return createProposalAnswerTuples(arrayOfProposals, arrayOfBoolean);
  }

  @action
  checkboxClicked() {
    this.answerChanged();
  }
}
