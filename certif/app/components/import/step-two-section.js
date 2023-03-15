import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class StepTwoSectionComponent extends Component {
  @service intl;

  get translatedErrorReport() {
    return this.args.errorsReport.map((errorReport) => ({
      line: errorReport.line,
      message: _translatedErrorCodeToMessage(this.intl, errorReport.code),
    }));
  }
}

function _translatedErrorCodeToMessage(intl, code) {
  return intl.t(`pages.sessions.import.step-two.blocking-errors.errors.${code}`);
}
