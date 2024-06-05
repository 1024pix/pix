import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class StepTwo extends Component {
  @service intl;

  get information() {
    const translationKey = `pages.certification-instructions.steps.2`;

    return {
      text: this.intl.t(`${translationKey}.text`, {
        htmlSafe: true,
      }),
      secondText: this.intl.t(`${translationKey}.second-text`, {
        htmlSafe: true,
      }),
      image: '/images/illustrations/certification-instructions-steps/clock.svg',
      imageText: this.intl.t(`${translationKey}.image-text`, {
        htmlSafe: true,
      }),
    };
  }
}
