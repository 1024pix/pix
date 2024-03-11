import { action } from '@ember/object';
import { service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import maxBy from 'lodash/maxBy';
import sumBy from 'lodash/sumBy';

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
}

function buildTooltipText(title, description) {
  let text = title ? `<strong>${title}</strong>` : '';
  text += description ? `<div>${description}</div>` : '';
  return htmlSafe(text);
}
