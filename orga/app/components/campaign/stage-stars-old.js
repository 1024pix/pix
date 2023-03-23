import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { htmlSafe } from '@ember/template';

export default class StageStarsOld extends Component {
  @service intl;

  @tracked withTooltip = this.args.withTooltip || false;

  get starsAcquired() {
    return this.args.reachedStage - 1;
  }

  get starsTotal() {
    return this.args.totalStage - 1;
  }

  get altMessage() {
    return this.intl.t('pages.assessment-individual-results.stages.value', {
      count: this.starsAcquired,
      total: this.starsTotal,
    });
  }

  get displayTooltip() {
    return Boolean(this.withTooltip && (this.args.prescriberTitle || this.args.prescriberDescription));
  }

  get tooltipText() {
    let text = this.args.prescriberTitle ? `<strong>${this.args.prescriberTitle}</strong>` : '';
    text += this.args.prescriberDescription ? `<p>${this.args.prescriberDescription}</p>` : '';
    return htmlSafe(text);
  }
}
