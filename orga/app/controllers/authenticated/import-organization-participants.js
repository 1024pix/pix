import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ImportController extends Controller {
  @service currentUser;
  @service session;
  @service intl;
  @service notifications;
  @service errorMessages;
  @service store;

  @tracked isLoading = false;
  @tracked errors = null;
  @tracked warnings = null;
  @tracked warningBanner = null;

  @action
  async importSupStudents(files) {
    await this._makeOnImport(async (adapter, organizationId) => {
      await adapter.addStudentsCsv(organizationId, files);
      this.send('refreshGroups');
    });
  }

  @action
  async replaceStudents(files) {
    await this._makeOnImport(async (adapter, organizationId) => {
      await adapter.replaceStudentsCsv(organizationId, files);
      this.send('refreshGroups');
    });
  }

  @action
  async importScoStudents(files) {
    await this._makeOnImport(async (adapter, organizationId) => {
      const format = this.currentUser.isAgriculture ? 'csv' : 'xml';
      await adapter.importStudentsSiecle(organizationId, files, format);
      this.send('refreshDivisions');
    });
  }

  @action
  async importOrganizationLearners(files) {
    await this._makeOnImport(async (adapter, organizationId) => {
      await adapter.importOrganizationLearners(organizationId, files);
    });
  }

  _wait(ms) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }

  _initializeUpload() {
    if (this.isLoading) return;

    this.isLoading = true;
    this.notifications.clearAll();

    this.errors = null;
    this.warnings = null;
    this.warningBanner = null;
  }

  async _makeOnImport(func) {
    this._initializeUpload();

    const adapter = this.store.adapterFor('organization-learners-import');
    const organizationId = this.currentUser.organization.id;

    const confirmBeforeClose = (event) => {
      event.preventDefault();
      return (event.returnValue = '');
    };
    window.addEventListener('beforeunload', confirmBeforeClose);

    try {
      // We add a minimal import time to avoid flashing loader to users
      await Promise.all([await func(adapter, organizationId), await this._wait(750)]);
    } finally {
      this.send('refreshModel');
      this.isLoading = false;
      window.removeEventListener('beforeunload', confirmBeforeClose);
    }
  }

  get participantListRoute() {
    return this.currentUser.isSCOManagingStudents
      ? 'authenticated.sco-organization-participants.list'
      : this.currentUser.isSUPManagingStudents
        ? 'authenticated.sup-organization-participants.list'
        : 'authenticated';
  }
}
