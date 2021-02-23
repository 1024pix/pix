import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

const _isStageReached = (result, stage) => result >= stage.threshold;

const _hasStars = (stage) => stage.threshold > 0;

export default class StageStars extends Component {
  @service intl;

  get starsAcquired() {
    const { result, stages } = this.args;
    const stagesReached = stages.filter((stage) => _hasStars(stage) && _isStageReached(result, stage));
    return stagesReached.length;
  }

  get starsTotal() {
    return this.args.stages.filter(_hasStars).length;
  }

  get altMessage() {
    return this.intl.t('pages.assessment-individual-results.stages.value', { count: this.starsAcquired, total: this.starsTotal });
  }
}
