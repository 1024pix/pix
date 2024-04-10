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
    this._initializeUpload();

    const adapter = this.store.adapterFor('students-import');
    const organizationId = this.currentUser.organization.id;

    try {
      await adapter.addStudentsCsv(organizationId, files);
      this.send('refreshGroups');
    } finally {
      this.send('refreshModel');
      this.isLoading = false;
    }
  }

  @action
  async importScoStudents(files) {
    this._initializeUpload();

    const adapter = this.store.adapterFor('students-import');
    const organizationId = this.currentUser.organization.id;
    const format = this.currentUser.isAgriculture ? 'csv' : 'xml';

    const confirmBeforeClose = (event) => {
      event.preventDefault();
      return (event.returnValue = '');
    };
    window.addEventListener('beforeunload', confirmBeforeClose);

    try {
      await adapter.importStudentsSiecle(organizationId, files, format);
      this.send('refreshDivisions');
    } finally {
      this.isLoading = false;
      this.send('refreshModel');
      window.removeEventListener('beforeunload', confirmBeforeClose);
    }
  }

  @action
  async replaceStudents(files) {
    this._initializeUpload();

    const adapter = this.store.adapterFor('students-import');
    const organizationId = this.currentUser.organization.id;

    try {
      await adapter.replaceStudentsCsv(organizationId, files);
      this.send('refreshGroups');
    } finally {
      this.send('refreshModel');
      this.isLoading = false;
    }
  }

  _initializeUpload() {
    if (this.isLoading) return;

    this.isLoading = true;
    this.notifications.clearAll();

    this.errors = null;
    this.warnings = null;
    this.warningBanner = null;
  }

  get participantListRoute() {
    return this.currentUser.isSCOManagingStudents
      ? 'authenticated.sco-organization-participants.list'
      : this.currentUser.isSUPManagingStudents
        ? 'authenticated.sup-organization-participants.list'
        : 'authenticated';
  }
}
