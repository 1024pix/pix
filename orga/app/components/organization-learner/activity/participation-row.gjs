import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { array } from '@ember/helper';
import { LinkTo } from '@ember/routing';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import CampaignType from '../../campaign/detail/type';
import Date from '../../ui/date';
import ParticipationStatus from '../../ui/participation-status';

export default class ParticipationRow extends Component {
  get routeName() {
    return this.args.participation.campaignType === 'ASSESSMENT'
      ? 'authenticated.campaigns.participant-assessment'
      : 'authenticated.campaigns.participant-profile';
  }

  <template>
    <PixTableColumn @context={{@context}}>
      <:header>
        {{t "pages.organization-learner.activity.participation-list.table.column.campaign-name"}}
      </:header>
      <:cell>
        <LinkTo @route={{this.routeName}} @models={{array @participation.campaignId @participation.id}}>
          {{@participation.campaignName}}
        </LinkTo>
      </:cell>
    </PixTableColumn>

    <PixTableColumn @context={{@context}}>
      <:header>{{t "pages.organization-learner.activity.participation-list.table.column.campaign-type"}}
      </:header>
      <:cell>
        <CampaignType @campaignType={{@participation.campaignType}} @displayInformationLabel={{true}} />
      </:cell>
    </PixTableColumn>

    <PixTableColumn @context={{@context}}>
      <:header>
        {{t "pages.organization-learner.activity.participation-list.table.column.created-at"}}
      </:header>
      <:cell>
        <Date @date={{@participation.createdAt}} />
      </:cell>
    </PixTableColumn>

    <PixTableColumn @context={{@context}}>
      <:header>
        {{t "pages.organization-learner.activity.participation-list.table.column.shared-at"}}
      </:header>
      <:cell>
        <Date @date={{@participation.sharedAt}} />
      </:cell>
    </PixTableColumn>

    <PixTableColumn @context={{@context}}>
      <:header>
        {{t "pages.organization-learner.activity.participation-list.table.column.status"}}
      </:header>
      <:cell>
        <ParticipationStatus @status={{@participation.status}} />
      </:cell>
    </PixTableColumn>

    <PixTableColumn @context={{@context}}>
      <:header>
        {{t "pages.organization-learner.activity.participation-list.table.column.participation-count"}}
      </:header>
      <:cell>
        {{@participation.participationCount}}
      </:cell>
    </PixTableColumn>
  </template>
}
