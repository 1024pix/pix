import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class StepTwoSectionComponent extends Component {
  @service intl;

  get translatedBlockingErrorReport() {
    const blockingErrorReports = this._blockingErrors;

    return blockingErrorReports.map(({ line, code }) => ({
      line,
      message: _translatedErrorCodeToMessage(this.intl, code),
    }));
  }
  get translatedNonBlockingErrorReport() {
    const nonBlockingErrors = this._nonBlockingErrors;

    return nonBlockingErrors.map(({ line, code }) => ({
      line,
      message: _translatedNonBlockingErrorCodeToMessage(this.intl, code),
    }));
  }

  get blockingErrorReportsCount() {
    const blockingErrorReports = this._blockingErrors;

    return blockingErrorReports?.length;
  }

  get nonBlockingErrorReportsCount() {
    const nonBlockingErrorReports = this._nonBlockingErrors;

    return nonBlockingErrorReports?.length;
  }

  get noError() {
    const blockingErrorReports = this._blockingErrors;
    const nonBlockingErrorReports = this._nonBlockingErrors;

    return !(nonBlockingErrorReports?.length || blockingErrorReports?.length);
  }

  get _blockingErrors() {
    return this.args.errorReports.filter((error) => error.isBlocking);
  }

  get _nonBlockingErrors() {
    return this.args.errorReports.filter((error) => !error.isBlocking);
  }

  get hasOnlyNonBlockingErrorReports() {
    return this.blockingErrorReportsCount === 0 && this.nonBlockingErrorReportsCount > 0;
  }
}

function _translatedErrorCodeToMessage(intl, code) {
  return intl.t(`pages.sessions.import.step-two.blocking-errors.errors.${code}`);
}

function _translatedNonBlockingErrorCodeToMessage(intl, code) {
  return intl.t(`pages.sessions.import.step-two.non-blocking-errors.errors.${code}`);
}
