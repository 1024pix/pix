import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';

export default class ImportCandidates extends Component {
  @service session;
  @service notifications;
  @service store;
  @service intl;

  @action
  async importCertificationCandidates(files) {
    const adapter = this.store.adapterFor('certification-candidates-import');
    const sessionId = this.args.session.id;

    this.isLoading = true;
    this.notifications.clearAll();
    try {
      await adapter.addCertificationCandidatesFromOds(sessionId, files);
      this.notifications.success(this.intl.t('pages.sessions.import.candidates-list.import-success'));
      this.args.reloadCertificationCandidate();
    } catch (errorResponse) {
      const errorMessage = this._handleErrorMessage(errorResponse);
      this.notifications.error(htmlSafe(errorMessage), { cssClasses: 'certification-candidates-notification' });
    } finally {
      this.isLoading = false;
    }
  }

  _handleErrorMessage(errorResponse) {
    const error = errorResponse?.errors?.[0];
    if (error?.code) {
      return this.intl.t(`common.api-error-messages.${error.code}`);
    }

    const errorPrefix = this.intl.t('pages.sessions.import.candidates-list.import-fail-prefix', { htmlSafe: true });
    let errorMessage = `${errorPrefix} Veuillez réessayer ou nous contacter via le formulaire du centre d'aide`;

    if (errorResponse?.errors) {
      errorResponse.errors.forEach((error) => {
        if (error.status === '422') {
          errorMessage = htmlSafe(`
              <p>
                ${errorPrefix}<b>${error.detail}</b>
              </p>`);
        }
      });
      return errorMessage;
    }

    return this.intl.t(`common.api-error-messages.internal-server-error`);
  }
}
