import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class LastParticipationDateTooltip extends Component {
  @service intl;

  get campaignTypeLabel() {
    return this.intl.t(`pages.students-sco.latest-participation-information.campaign-${this.args.campaignType}-type`);
  }

  get participationStatusLabel() {
    return this.intl.t(
      `pages.students-sco.latest-participation-information.participation-${this.args.participationStatus}-status`
    );
  }
}
