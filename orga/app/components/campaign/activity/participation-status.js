import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class ParticipationStatus extends Component {
  @service intl;

  get color() {
    const { status } = this.args;
    return COLORS[status];
  }

  get label() {
    const { status, progression, isTypeAssessment } = this.args;
    const type = isTypeAssessment ? 'assessment' : 'profile';
    return this.intl.t(`pages.campaign-activity.status.${status}-${type}`, { progression });
  }
}

const COLORS = {
  completed: 'purple-light',
  started: 'blue-light',
  shared: 'green-light',
};
