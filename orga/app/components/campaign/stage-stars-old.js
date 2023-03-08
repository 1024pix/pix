import _maxBy from 'lodash/maxBy';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { htmlSafe } from '@ember/template';

const _isStageReached = (result, stage) => result >= stage.threshold;

const _hasStars = (stage) => stage.threshold > 0;

export default class StageStarsOld extends Component {
  @service intl;

  @tracked withTooltip = this.args.withTooltip || false;

  get reachedStage() {
    const { result, stages } = this.args;
    const stagesReached = stages.filter((stage) => _hasStars(stage) && _isStageReached(result, stage));
    return _maxBy(stagesReached, 'threshold');
  }

  get starsAcquired() {
    const { result, stages } = this.args;
    const stagesReached = stages.filter((stage) => _hasStars(stage) && _isStageReached(result, stage));
    return stagesReached.length;
  }

  get starsTotal() {
    return this.args.stages.filter(_hasStars).length;
  }

  get altMessage() {
    return this.intl.t('pages.assessment-individual-results.stages.value', {
      count: this.starsAcquired,
      total: this.starsTotal,
    });
  }

  get displayTooltip() {
    return Boolean(
      this.withTooltip &&
        this.reachedStage &&
        (this.reachedStage.prescriberTitle || this.reachedStage.prescriberDescription)
    );
  }

  get tooltipText() {
    let text = this.reachedStage.prescriberTitle ? `<strong>${this.reachedStage.prescriberTitle}</strong>` : '';
    text += this.reachedStage.prescriberDescription ? `<p>${this.reachedStage.prescriberDescription}</p>` : '';
    return htmlSafe(text);
  }
}
