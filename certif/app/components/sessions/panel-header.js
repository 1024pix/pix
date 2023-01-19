import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class PanelHeader extends Component {
  @service fileSaver;
  @service session;
  @service featureToggles;
  @service notifications;
  @service intl;
  @service currentUser;
  @service store;

  get shouldRenderImportTemplateButton() {
    return this.featureToggles.featureToggles.isMassiveSessionManagementEnabled;
  }

  @action
  async downloadSessionImportTemplate() {
    const url = '/api/certification-centers/import';
    const token = this.session.data.authenticated.access_token;
    try {
      await this.fileSaver.save({ url, token });
    } catch (e) {
      this.notifications.error(this.intl.t('pages.sessions.list.header.session-import-template-dl-error'));
    }
  }

  @action
  async importSessions(files) {
    const adapter = this.store.adapterFor('sessions-import');
    const certificationCenterId = this.currentUser.currentAllowedCertificationCenterAccess.id;
    this.notifications.clearAll();
    try {
      await adapter.importSessions(files, certificationCenterId);
      await this.args.reloadSessionSummaries();
      this.notifications.success('La liste des sessions a été importée avec succès.');
    } catch (err) {
      this.notifications.error("Aucune session n'a été importée");
    }
  }
}
