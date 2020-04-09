import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Controller from '@ember/controller';

export default class IndexController extends Controller {
  @service sessionInfoService;
  @service notifications;

  @alias('model') session;

  @action
  downloadSessionResultFile() {
    try {
      this.sessionInfoService.downloadSessionExportFile(this.session);
    } catch (error) {
      this.notifications.error(error);
    }
  }

  @action
  downloadBeforeJuryFile() {
    try {
      this.sessionInfoService.downloadJuryFile(this.model.id, this.model.certifications);
    } catch (error) {
      this.notifications.error(error);
    }
  }

  @action
  async tagSessionAsSentToPrescriber() {
    await this.session.save({ adapterOptions: { flagResultsAsSentToPrescriber: true } });
  }

  @action
  async assignSessionToCurrentUser() {
    try {
      await this.session.save({ adapterOptions: { userAssignment: true } });
      this.notifications.success('La session vous a correctement été assignée');
    } catch (err) {
      this.notifications.error('Erreur lors de l\'assignation à la session');
    }
  }
}
