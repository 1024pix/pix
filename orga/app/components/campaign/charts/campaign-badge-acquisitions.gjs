import { PixTooltip } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import ChartCard from '../../ui/chart-card';

export default class CampaignBadgeAcquisitions extends Component {
  @service store;

  @tracked data = [];
  @tracked totalStage = [];
  @tracked loading = true;

  constructor(...args) {
    super(...args);
    const { campaignId } = this.args;

    const adapter = this.store.adapterFor('campaign-stats');
    adapter.getBadgeAcquisitions(campaignId).then((response) => {
      this.data = response.data.attributes.data;
    });
  }

  <template>
    <ChartCard class="badge-acquisitions" @title={{t "cards.badges-acquisitions.title"}} @info={{true}} ...attributes>
      <ul class="badge-acquisitions__list">
        {{#each this.data as |badgeAcquisition|}}
          <li class="badge-acquisitions__list-item">
            <PixTooltip @id="badge-tooltip-{{badgeAcquisition.badge.id}}" @position="left" @isInline={{true}}>
              <:triggerElement>
                <img
                  src={{badgeAcquisition.badge.imageUrl}}
                  alt={{badgeAcquisition.badge.altMessage}}
                  tabindex="0"
                  aria-describedby="badge-tooltip-{{badgeAcquisition.badge.id}}"
                />
              </:triggerElement>
              <:tooltip>
                {{badgeAcquisition.badge.title}}
              </:tooltip>
            </PixTooltip>
            <span class="badge-acquisitions__count">
              {{badgeAcquisition.count}}
            </span>
            <span class="badge-acquisitions__percentage">
              {{t "cards.badges-acquisitions.obtained"}}
              ({{badgeAcquisition.percentage}}%)
            </span>
          </li>
        {{/each}}
      </ul>
    </ChartCard>
  </template>
}
