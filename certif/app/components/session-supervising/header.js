import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class Header extends Component {
  @tracked isConfirmationModalDisplayed = false;
  @service router;

  @action
  askUserToConfirmLeaving() {
    this.modalDescriptionText =
      'Attention, assurez-vous que tous les candidats aient terminé leur test avant de quitter la surveillance. Pour reprendre la surveillance de cette session, vous devrez entrer à nouveau son numéro de session et son mot de passe.';
    this.modalCancelText = 'Annuler';
    this.modalConfirmationText = `Quitter la surveillance`;
    this.modalInstructionText = `Quitter la surveillance de la session ${this.args.session.id}`;
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
