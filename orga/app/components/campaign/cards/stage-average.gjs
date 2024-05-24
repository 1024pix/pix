import PixIndicatorCard from '@1024pix/pix-ui/components/pix-indicator-card';
import PixStars from '@1024pix/pix-ui/components/pix-stars';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class StageAverage extends Component {
  @service intl;

  get starsAcquired() {
    return this.args.reachedStage - 1;
  }

  get starsTotal() {
    return this.args.totalStage - 1;
  }

  get altMessage() {
    return this.intl.t('common.result.stages', {
      count: this.starsAcquired,
      total: this.starsTotal,
    });
  }
  <template>
    <PixIndicatorCard
      @title={{t "cards.participants-average-stages.title"}}
      @icon="crown"
      @color="blue"
      @info={{t "cards.participants-average-stages.information"}}
      @isLoading={{@isLoading}}
      class="indicator-card"
      ...attributes
    >
      <:default>
        <PixStars
          @count={{this.starsAcquired}}
          @total={{this.starsTotal}}
          @alt={{this.altMessage}}
          @color="blue"
          class="stage-average-stars"
        />
      </:default>
    </PixIndicatorCard>
  </template>
}
