import { set } from '@ember/object';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class CandidateInList extends Component {
  @service notifications;

  @tracked isMenuOpen = false;
  @tracked isConfirmationModalDisplayed = false;
  @tracked modalDescriptionText;
  @tracked modalCancelText;
  @tracked modalConfirmationText;
  @tracked modalInstructionText;
  @tracked actionOnConfirmation;

  get isCheckboxToBeDisplayed() {
    return !this.args.candidate.hasStarted && !this.args.candidate.hasCompleted;
  }

  get optionsMenuShouldBeDisplayed() {
    return this.args.candidate.hasStarted;
  }

  @action
  async toggleCandidate(candidate) {
    await this.args.toggleCandidate(candidate);
  }

  @action
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  @action
  closeMenu() {
    this.isMenuOpen = false;
  }

  @action
  askUserToConfirmTestResume() {
    this.modalDescriptionText = 'Si le candidat a fermé la fenêtre de son test de certification (par erreur, ou à cause d\'un problème technique) et est toujours présent dans la salle de test, vous pouvez lui permettre de reprendre son test à l\'endroit où il l\'avait quitté.';
    this.modalCancelText = 'Fermer';
    this.modalConfirmationText = 'Je confirme l\'autorisation';
    this.modalInstructionText = `Autoriser ${this.args.candidate.firstName} ${this.args.candidate.lastName} à reprendre son test ?`;
    set(this, 'actionOnConfirmation', this.authorizeTestResume);
    this.isConfirmationModalDisplayed = true;
  }

  @action
  askUserToConfirmTestEnd() {
    this.modalDescriptionText = 'Attention : cette action entraîne la fin de son test de certification et est irréversible.';
    this.modalCancelText = 'Annuler';
    this.modalConfirmationText = 'Terminer le test';
    this.modalInstructionText = `Terminer le test de ${this.args.candidate.firstName} ${this.args.candidate.lastName} ?`;
    set(this, 'actionOnConfirmation', this.endAssessmentForCandidate);
    this.isConfirmationModalDisplayed = true;
  }

  @action
  closeConfirmationModal() {
    this.isConfirmationModalDisplayed = false;
  }

  @action
  async authorizeTestResume() {
    this.closeConfirmationModal();
    try {
      await this.args.onCandidateTestResumeAuthorization(this.args.candidate);
      this.notifications.success(
        `Succès ! ${this.args.candidate.firstName} ${this.args.candidate.lastName} peut reprendre son test de certification.`,
      );
    } catch (error) {
      this.notifications.error(
        `Une erreur est survenue, ${this.args.candidate.firstName} ${this.args.candidate.lastName} n'a a pu être autorisé à reprendre son test.`,
      );
    }
  }

  @action
  async endAssessmentForCandidate() {
    this.closeConfirmationModal();
    try {
      await this.args.onSupervisorEndAssessment(this.args.candidate);
      this.notifications.success(
        `Succès ! Le test de  ${this.args.candidate.firstName} ${this.args.candidate.lastName} est terminé.`,
      );
    } catch (error) {
      this.notifications.error(
        `Une erreur est survenue, le test de ${this.args.candidate.firstName} ${this.args.candidate.lastName} n'a pas pu être terminé`,
      );
    }
  }

  get actionMethod() {
    return this.actionOnConfirmation;
  }
}
