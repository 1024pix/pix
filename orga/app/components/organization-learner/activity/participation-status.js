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
    return this.intl.t(`pages.organization-learner.activity.participation-list.status.${status}-${campaignType}`);
  }
}

const COLORS = {
  STARTED: 'yellow-light',
  TO_SHARE: 'orange-light',
  SHARED: 'green-light',
};
