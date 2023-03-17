import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class StepTwoSectionComponent extends Component {
  @service intl;

  get translatedErrorReport() {
    return this.args.blockingErrorReports.map(({ line, code }) => ({
      line,
      message: _translatedErrorCodeToMessage(this.intl, code),
    }));
  }
}

function _translatedErrorCodeToMessage(intl, code) {
  return intl.t(`pages.sessions.import.step-two.blocking-errors.errors.${code}`);
}
