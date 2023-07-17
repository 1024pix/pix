import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class LastParticipationDateTooltip extends Component {
  @service intl;

  get campaignTypeLabel() {
    return this.intl.t(
      `pages.participants-list.latest-participation-information-tooltip.campaign-${this.args.campaignType}-type`,
    );
  }

  get participationStatusLabel() {
    return this.intl.t(
      `pages.participants-list.latest-participation-information-tooltip.participation-${this.args.participationStatus}-status`,
    );
  }
}
