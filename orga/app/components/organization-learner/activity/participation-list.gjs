import { PixTable } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';

import ParticipationRow from './participation-row';

export default class ParticipationList extends Component {
  @service router;

  @action
  goToParticipationDetail(participation) {
    const routeName =
      participation.campaignType === 'ASSESSMENT'
        ? 'authenticated.campaigns.participant-assessment'
        : 'authenticated.campaigns.participant-profile';
    this.router.transitionTo(routeName, participation.campaignId, participation.lastCampaignParticipationId);
  }

  <template>
    <PixTable @variant="orga" @data={{@participations}} class="table" @onRowClick={{this.goToParticipationDetail}}>
      <:columns as |participation context|>
        <ParticipationRow @participation={{participation}} @context={{context}} />
      </:columns>
    </PixTable>
  </template>
}
