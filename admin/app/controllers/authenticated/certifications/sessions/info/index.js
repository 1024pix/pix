import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Controller from '@ember/controller';
import { statusToDisplayName } from '../../../../../models/session';

export default class IndexController extends Controller {
  @service
  sessionInfoService;

  @service
  notifications;

  @alias('model')
  session;

  @computed('session.isFinalized')
  get sessionStatusLabel() {
    return this.session.isFinalized ? statusToDisplayName.finalized : statusToDisplayName.created;
  }

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
  },

}
