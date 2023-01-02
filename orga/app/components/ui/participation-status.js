import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class ParticipationStatus extends Component {
  @service intl;

  get color() {
    const { status } = this.args;
    return COLORS[status];
  }

  get label() {
    const { status, campaignType } = this.args;
    return this.intl.t(`components.participation-status.${status}-${campaignType}`);
  }
}

const COLORS = {
  STARTED: 'orange-light',
  TO_SHARE: 'purple-light',
  SHARED: 'green-light',
};
