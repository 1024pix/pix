import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ImportController extends Controller {
  @service fileSaver;
  @service session;
  @service featureToggles;
  @service notifications;
  @service intl;
  @service currentUser;
  @service store;

  @tracked file = null;
  @tracked isImportDisabled = true;

  get fileName() {
    return this.file.name;
  }

  @action
  async downloadSessionImportTemplate() {
    const certificationCenterId = this.currentUser.currentAllowedCertificationCenterAccess.id;
    const url = `/api/certification-centers/${certificationCenterId}/import`;
    const token = this.session.data.authenticated.access_token;
    try {
      await this.fileSaver.save({ url, token });
    } catch (e) {
      this.notifications.error(this.intl.t('pages.sessions.sessions.session-import-template-dl-error'));
    }
  }

  @action
  preImportSessions() {
    this.file = document.getElementById('file-upload').files[0];
    this.isImportDisabled = false;
  }

  @action
  async importSessions() {
    const adapter = this.store.adapterFor('sessions-import');
    const certificationCenterId = this.currentUser.currentAllowedCertificationCenterAccess.id;
    this.notifications.clearAll();
    this.isImportDisabled = true;
    try {
      if (!this.file) {
        return;
      }
      await adapter.importSessions(this.file, certificationCenterId);
      this.notifications.success('La liste des sessions a été importée avec succès.');
    } catch (err) {
      this.notifications.error("Aucune session n'a été importée");
    } finally {
      this.removeImport();
    }
  }

  @action
  removeImport() {
    this.file = null;
    this.isImportDisabled = true;
  }
}
