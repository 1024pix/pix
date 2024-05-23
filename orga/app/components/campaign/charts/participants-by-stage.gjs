import PixStars from '@1024pix/pix-ui/components/pix-stars';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import maxBy from 'lodash/maxBy';
import sumBy from 'lodash/sumBy';

import ChartCard from '../../ui/chart-card';
import ParticipantsByStageBar from './participants-by-stage-bar';
import ParticipantsByStageLoader from './participants-by-stage-loader';

export default class ParticipantsByStage extends Component {
  @service store;

  @tracked data = [];
  @tracked totalStage = [];
  @tracked loading = true;

  constructor(...args) {
    super(...args);
    const { campaignId } = this.args;

    const adapter = this.store.adapterFor('campaign-stats');
    adapter.getParticipationsByStage(campaignId).then((response) => {
      const { data } = response.data.attributes;
      const maxValue = maxBy(data, 'value').value;
      const totalValues = sumBy(data, 'value');

      this.totalStage = data.length - 1;

      this.data = data.map((stage, index) => {
        const masteryRate = totalValues !== 0 ? stage.value / totalValues : 0;
        const width = maxValue !== 0 ? Math.round((stage.value / maxValue) * 100) : 0;
        return {
          index,
          id: stage.id,
          value: stage.value,
          title: stage.title,
          description: stage.description,
          masteryRate,
          barWidth: `width: ${width}%`,
          tooltip: buildTooltipText(stage.title, stage.description),
          displayTooltip: stage.title || stage.description,
        };
      });
      this.loading = false;
    });
  }

  @action
  onClickBar(id) {
    if (!this.args.onSelectStage) return;
    this.args.onSelectStage(id);
  }

  <template>
    <ChartCard @title={{t "charts.participants-by-stage.title"}} ...attributes>
      {{#if this.loading}}
        <ParticipantsByStageLoader />
      {{else}}
        <ul class="participants-by-stage__wrapper">
          {{#each this.data as |stage index|}}
            <li class="participants-by-stage">
              <PixStars
                @count={{stage.index}}
                @total={{this.totalStage}}
                @color="blue"
                @alt={{t "common.result.stages" count=stage.index total=this.totalStage}}
                class="participants-by-stage__stars"
              />
              <div class="participants-by-stage__values">
                {{t "charts.participants-by-stage.participants" count=stage.value}}
              </div>
              {{#if stage.displayTooltip}}
                <PixTooltip
                  @id="chart-stage-{{index}}"
                  @position="bottom-right"
                  @isWide={{true}}
                  class="participants-by-stage__container"
                >
                  <:triggerElement>
                    <ParticipantsByStageBar
                      @onClickBar={{this.onClickBar}}
                      @stageId={{stage.id}}
                      @barWidth={{stage.barWidth}}
                      tabindex="0"
                      aria-describedby="chart-stage-{{index}}"
                    >
                      {{t "common.result.percentage" value=stage.masteryRate}}
                    </ParticipantsByStageBar>
                  </:triggerElement>
                  <:tooltip>
                    {{stage.tooltip}}
                  </:tooltip>
                </PixTooltip>
              {{else}}
                <div class="participants-by-stage__container">
                  <ParticipantsByStageBar
                    @onClickBar={{this.onClickBar}}
                    @stageId={{stage.id}}
                    @barWidth={{stage.barWidth}}
                  >
                    {{t "common.result.percentage" value=stage.masteryRate}}
                  </ParticipantsByStageBar>
                </div>
              {{/if}}
            </li>
          {{/each}}
        </ul>
      {{/if}}
    </ChartCard>
  </template>
}

function buildTooltipText(title, description) {
  let text = title ? `<strong>${title}</strong>` : '';
  text += description ? `<div>${description}</div>` : '';
  return htmlSafe(text);
}
