import Component from '@glimmer/component';
import { action } from '@ember/object';
import maxBy from 'lodash/maxBy';
import sumBy from 'lodash/sumBy';
import { htmlSafe } from '@ember/string';

export default class ParticipantsByStage extends Component {
  constructor(...args) {
    super(...args);
    const { data } = this.args;

    const maxValue = maxBy(data, 'value').value;
    const totalValues = sumBy(data, 'value');

    this.data = data.map((stage) => ({
      ...stage,
      percentage: Math.round((stage.value / totalValues) * 100),
      barWidth: `width: ${Math.round((stage.value / maxValue) * 100)}%`,
      tooltip: buildTooltipText(stage.title, stage.description),
    }));
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
