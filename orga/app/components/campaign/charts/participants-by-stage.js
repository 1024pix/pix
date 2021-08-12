import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import maxBy from 'lodash/maxBy';
import sumBy from 'lodash/sumBy';
import { htmlSafe } from '@ember/string';

export default class ParticipantsByStage extends Component {
  @service store;

  @tracked data = [];
  @tracked totalStage = [];
  @tracked loading = true;

  constructor(...args) {
    super(...args);
    const { campaignId } = this.args;

    const adapter = this.store.adapterFor('campaign-stats');
    adapter.getParticipationsByStage(campaignId)
      .then((response) => {
        const { data } = response.data.attributes;
        const maxValue = maxBy(data, 'value').value;
        const totalValues = sumBy(data, 'value');

        this.totalStage = data.length - 1;

        this.data = data.map((stage, index) => {
          const percentage = totalValues !== 0 ? Math.round((stage.value / totalValues) * 100) : 0;
          const width = maxValue !== 0 ? Math.round((stage.value / maxValue) * 100) : 0;
          return {
            index,
            id: stage.id,
            value: stage.value,
            title: stage.title,
            description: stage.description,
            percentage,
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
