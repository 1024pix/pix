import { action } from '@ember/object';
import { service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';

export default class ImportCandidates extends Component {
  @service session;
  @service pixToast;
  @service store;
  @service intl;

  @action
  async importCertificationCandidates(files) {
    const adapter = this.store.adapterFor('certification-candidates-import');
    const sessionId = this.args.session.id;

    this.isLoading = true;
    try {
      await adapter.addCertificationCandidatesFromOds(sessionId, files);
      this.pixToast.sendSuccessNotification({
        message: this.intl.t('pages.sessions.import.candidates-list.import-success'),
      });
      await this.args.reloadCertificationCandidate();
    } catch (errorResponse) {
      const errorMessage = this._handleErrorMessage(errorResponse);

      this.pixToast.sendErrorNotification({ message: htmlSafe(errorMessage) });
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
