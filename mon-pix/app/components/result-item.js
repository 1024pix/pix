import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import resultIcon from 'mon-pix/utils/result-icon';

export default class ResultItemComponent extends Component {
  @service intl;

  get resultItem() {
    return resultIcon(this.args.answer.result);
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
