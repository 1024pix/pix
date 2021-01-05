import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

const contentReference = {
  ok: {
    icon: 'check-circle',
    color: 'green',
  },
  ko: {
    icon: 'times-circle',
    color: 'red',
  },
  aband: {
    icon: 'times-circle',
    color: 'grey',
  },
  partially: {
    icon: 'check-circle',
    color: 'orange',
  },
  timedout: {
    icon: 'times-circle',
    color: 'red',
  },
};

export default class ResultItemComponent extends Component {
  @service intl;

  get resultItem() {
    if (this.args.answer.result) {
      return contentReference[this.args.answer.result];
    }
    return undefined;
  }

  get resultTooltip() {
    return this.resultItem ? this.intl.t(`pages.comparison-window.results.${this.args.answer.result}.tooltip`) : null;
  }

  get validationImplementedForChallengeType() {
    const implementedTypes = ['QCM', 'QROC', 'QCU', 'QROCM-ind', 'QROCM-dep'];
    const challengeType = this.args.answer.get('challenge.type');
    return implementedTypes.includes(challengeType);
  }

  get textLength() {
    return window.innerWidth <= 767 ? 60 : 110;
  }

}
