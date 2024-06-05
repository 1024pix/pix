import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class StepThree extends Component {
  @service intl;

  get information() {
    const translationKey = `pages.certification-instructions.steps.3`;

    return {
      text: this.intl.t(`${translationKey}.text`, {
        htmlSafe: true,
      }),
      secondText: this.intl.t(`${translationKey}.second-text`, {
        htmlSafe: true,
      }),
      images: [
        '/images/illustrations/certification-instructions-steps/regular-challenge-round.svg',
        '/images/illustrations/certification-instructions-steps/focus-challenge-round.svg',
      ],
    };
  }
}
