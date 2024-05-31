import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import sumBy from 'lodash/sumBy';

import ParticipantsCount from '../cards/participants-count';
import SharedCount from '../cards/shared-count';
import ParticipantsByDay from '../charts/participants-by-day';
import ParticipantsByStatus from '../charts/participants-by-status';

export default class Dashboard extends Component {
  @service store;

  @tracked participantCountByStatus = [];
  @tracked total = 0;
  @tracked shared = 0;
  @tracked participantsByStatusLoading = true;

  constructor(...args) {
    super(...args);
    const adapter = this.store.adapterFor('campaign-stats');

    adapter.getParticipationsByStatus(this.args.campaign.id).then((response) => {
      const data = response.data.attributes;
      this.shared = data.shared;
      this.participantCountByStatus = Object.entries(data);
      this.total = sumBy(this.participantCountByStatus, ([_, count]) => count);
      this.participantsByStatusLoading = false;
    });
  }
  <template>
    <section class="activity-dashboard" ...attributes>
      <div class="activity-dashboard__row">
        <ParticipantsCount
          @value={{this.total}}
          @isLoading={{this.participantsByStatusLoading}}
          class="activity-dashboard__total-participants-card"
        />
        <SharedCount
          @value={{this.shared}}
          @isLoading={{this.participantsByStatusLoading}}
          @isTypeAssessment={{@campaign.isTypeAssessment}}
        />
      </div>
      <div class="activity-dashboard__row">
        <ParticipantsByDay
          @campaignId={{@campaign.id}}
          @totalParticipations={{@totalParticipations}}
          @isTypeAssessment={{@campaign.isTypeAssessment}}
          class="activity-dashboard__participations-by-day"
        />
        <ParticipantsByStatus
          @loading={{this.participantsByStatusLoading}}
          @participantCountByStatus={{this.participantCountByStatus}}
          @isTypeAssessment={{@campaign.isTypeAssessment}}
          class="activity-dashboard__participations-by-status"
        />
      </div>
    </section>
  </template>
}
