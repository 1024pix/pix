import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class StepOne extends Component {
  @service intl;

  get text() {
    return this.intl.t(`pages.certification-instructions.steps.1.text`, {
      htmlSafe: true,
    });
  }
}
