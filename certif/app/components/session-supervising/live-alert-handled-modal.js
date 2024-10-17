import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class LiveAlertHandledModal extends Component {
  @service intl;

  @action
  title() {
    return this.intl.t('pages.session-supervising.candidate-in-list.handle-live-alert-modal.title', {
      candidateFullName: this.args.candidateFullName,
    });
  }
}
