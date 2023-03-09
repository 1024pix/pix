import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class StageAverage extends Component {
  @service intl;

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
}
