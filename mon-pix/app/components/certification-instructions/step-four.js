import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class StepFour extends Component {
  @service intl;

  get text() {
    return this.intl.t(`pages.certification-instructions.steps.4.text`, {
      htmlSafe: true,
    });
  }
}
