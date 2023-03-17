import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class StepTwoSectionComponent extends Component {
  @service intl;

  get translatedBlockingErrorReport() {
    return this.args.blockingErrorReports.map(({ line, code }) => ({
      line,
      message: _translatedErrorCodeToMessage(this.intl, code),
    }));
  }
  get translatedNonBlockingErrorReport() {
    return this.args.nonBlockingErrorReports.map(({ line, code }) => ({
      line,
      message: _translatedNonBlockingErrorCodeToMessage(this.intl, code),
    }));
  }

  get blockingErrorReportsCount() {
    return this.args.blockingErrorReports?.length;
  }

  get nonBlockingErrorReportsCount() {
    return this.args.nonBlockingErrorReports?.length;
  }
}

function _translatedErrorCodeToMessage(intl, code) {
  return intl.t(`pages.sessions.import.step-two.blocking-errors.errors.${code}`);
}

function _translatedNonBlockingErrorCodeToMessage(intl, code) {
  return intl.t(`pages.sessions.import.step-two.non-blocking-errors.errors.${code}`);
}
