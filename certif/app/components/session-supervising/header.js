import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class Header extends Component {
  @service router;
  @service intl;

  @tracked modalDescriptionText;
  @tracked modalCancelText;
  @tracked modalConfirmationText = this.intl.t('common.actions.confirm');
  @tracked modalInstructionText = this.intl.t('pages.session-supervising.candidate-in-list.default-modal-title');
  @tracked isConfirmationModalDisplayed = false;

  @action
  askUserToConfirmLeaving() {
    this.modalDescriptionText = this.intl.t('pages.session-supervising.header.information');
    this.modalCancelText = this.intl.t('common.actions.cancel');
    this.modalConfirmationText = this.intl.t('pages.session-supervising.header.actions.confirmation');
    this.modalInstructionText = this.intl.t('pages.session-supervising.header.actions.exit-extra-information', {
      sessionId: this.args.session.id,
    });
    this.isConfirmationModalDisplayed = true;
  }

  @action
  closeConfirmationModal() {
    this.isConfirmationModalDisplayed = false;
  }

  @action
  actionConfirmation() {
    this.closeConfirmationModal();
    return this.router.replaceWith('login-session-supervisor');
  }
}
