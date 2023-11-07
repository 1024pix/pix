import Component from '@glimmer/component';
import { service } from '@ember/service';
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
      await this.args.reloadCertificationCandidate();
    } catch (errorResponse) {
      const errorMessage = this._handleErrorMessage(errorResponse);
      this.notifications.error(htmlSafe(errorMessage), { cssClasses: 'certification-candidates-notification' });
    } finally {
      this.isLoading = false;
    }
  }

  _handleErrorMessage(errorResponse) {
    const error = errorResponse?.errors?.[0];
    const errorPrefix = this.intl.t('pages.sessions.import.candidates-list.import-fail-prefix', { htmlSafe: true });

    if (error?.code) {
      if (error.meta?.line) {
        return `${errorPrefix} ${this.intl.t(`common.labels.line`, { line: error.meta.line })}
        ${this.intl.t(`common.api-error-messages.certification-candidate.${error.code}`, {
          ...error.meta,
        })}`;
      }

      return `${errorPrefix} ${this.intl.t(`common.api-error-messages.${error.code}`)}`;
    }
    return `${errorPrefix} ${this.intl.t('pages.sessions.import.candidates-list.try-again-or-contact')}`;
  }
}
