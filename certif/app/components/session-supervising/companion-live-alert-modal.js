import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class CompanionLiveAlertModal extends Component {
  @service intl;

  @action
  title() {
    return this.intl.t('pages.session-supervising.candidate-in-list.modals.live-alerts.companion.title', {
      candidateFullName: this.args.candidateFullName,
    });
  }

  @action
  onClose() {
    this.args.closeConfirmationModal();
  }

  @action
  onSubmit() {
    this.args.clearedLiveAlert();
  }
}
