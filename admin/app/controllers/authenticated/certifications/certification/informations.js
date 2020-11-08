import Controller from '@ember/controller';
import { action } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

const MAX_REACHABLE_LEVEL = 5;
const MAX_REACHABLE_PIX_BY_COMPETENCE = 40;

export default class CertificationInformationsController extends Controller {

  @service notifications;
  @service router;

  @alias('model') certification;

  @tracked displayConfirm = false;
  @tracked confirmErrorMessage = null;
  @tracked markUpdatedRequired = false;

  @action
  openConfirm() {
    this.displayConfirm = true;
    const errors = this._getCertificationErrorsAfterJuryUpdateIfAny();
    this.confirmErrorMessage = this._formatErrorsToHtmlString(errors);
  }

  @action
  cancelCertificationSaving() {
    this.displayConfirm = false;
  }

  @action
  async saveCertification() {
    try {
      const competencesWithMark = this.certification.competencesWithMark;

      if (this.markUpdatedRequired) {
        await this.certification.saveCompetenceMarks();
      }
      await this.certification.saveWithoutUpdatingCompetenceMarks();
      this.certification.competencesWithMark = competencesWithMark;

      this.markUpdatedRequired = false;
      this.notifications.success('Modifications enregistrées');

    } catch (e) {
      if (e.errors && e.errors.length > 0) {
        e.errors.forEach((error) => {
          this.notifications.error(error.detail);
        });
      } else {
        this.notifications.error(e);
      }
    } finally {
      this.displayConfirm = false;
    }
  }

  _getCertificationErrorsAfterJuryUpdateIfAny() {
    return this._getCertificationErrorsAfterJuryUpdate(this.certification.competencesWithMark);
  }

  _getCertificationErrorsAfterJuryUpdate(competencesWithMark) {
    const errors = [];
    for (const [index, { level, score }] of competencesWithMark.entries()) {
      if (level > MAX_REACHABLE_LEVEL) {
        errors.push({
          type: 'level',
          message: 'Le niveau de la compétence ' + competencesWithMark[index].competence_code + ' dépasse ' + MAX_REACHABLE_LEVEL,
        });
      }
      if (score > MAX_REACHABLE_PIX_BY_COMPETENCE) {
        errors.push({
          type: 'score',
          message: 'Le nombre de pix de la compétence ' + competencesWithMark[index].competence_code + ' dépasse ' + MAX_REACHABLE_PIX_BY_COMPETENCE,
        });
      }
    }
    return errors;
  }

  _formatErrorsToHtmlString(errors) {
    return errors && errors.map((err) => `${err.message}\n`).join('');
  }
}
