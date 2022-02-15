import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import buttonStatusTypes from 'mon-pix/utils/button-status-types';
import { inject as service } from '@ember/service';

export default class Card extends Component {
  @service intl;

  @tracked savingStatus = buttonStatusTypes.unrecorded;

  constructor(owner, args) {
    super(owner, args);
    this.savingStatus = args.tutorial.isSaved ? buttonStatusTypes.recorded : buttonStatusTypes.unrecorded;
    this.evaluationStatus = args.tutorial.isEvaluated ? buttonStatusTypes.recorded : buttonStatusTypes.unrecorded;
  }

  get buttonLabel() {
    return this.savingStatus === buttonStatusTypes.recorded
      ? this.intl.t('pages.user-tutorials.list.tutorial.actions.remove.label')
      : this.intl.t('pages.user-tutorials.list.tutorial.actions.save.label');
  }
}
