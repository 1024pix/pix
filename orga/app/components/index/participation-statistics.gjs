import { PixIndicatorCard } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class ParticipationStatistics extends Component {
  @service intl;

  get completionRateTitle() {
    return this.intl.t('components.index.participation-statistics.completion-rate.title');
  }

  get completionRateInfo() {
    return this.intl.t('components.index.participation-statistics.completion-rate.info');
  }

  get completedParticipationsCount() {
    return this.args.participationStatistics?.completedParticipationCount || 0;
  }

  get sharedParticipationCountLastThirtyDays() {
    return this.args.participationStatistics?.sharedParticipationCountLastThirtyDays || 0;
  }

  get totalParticipationCount() {
    return this.args.participationStatistics?.totalParticipationCount || 0;
  }

  get completionRateDescription() {
    return this.totalParticipationCount === 0
      ? this.intl.t('components.index.participation-statistics.completion-rate.no-activity')
      : this.intl.t('components.index.participation-statistics.completion-rate.description', {
          completed: this.completedParticipationsCount,
          started: this.totalParticipationCount,
        });
  }

  get completionRatePercentage() {
    return this.totalParticipationCount === 0
      ? '-'
      : Math.round((this.completedParticipationsCount / this.totalParticipationCount) * 100) + '%';
  }

  get completedParticipationsTitle() {
    return this.intl.t('components.index.participation-statistics.completed-participations.title');
  }

  get completedParticipationsInfo() {
    return this.intl.t('components.index.participation-statistics.completed-participations.info');
  }

  get completedParticipationsDescription() {
    return this.sharedParticipationCountLastThirtyDays === 0
      ? this.intl.t('components.index.participation-statistics.completed-participations.no-completed-participations')
      : this.intl.t('components.index.participation-statistics.completed-participations.description');
  }

  <template>
    <section class="participation-statistics">

      <PixIndicatorCard
        @title={{this.completionRateTitle}}
        @color="success"
        @iconName="speed"
        @info={{this.completionRateInfo}}
      >
        <:default>{{this.completionRatePercentage}}</:default>
        <:sub>
          {{this.completionRateDescription}}
        </:sub>
      </PixIndicatorCard>

      <PixIndicatorCard
        @title={{this.completedParticipationsTitle}}
        @color="tertiary"
        @iconName="inboxIn"
        @info={{this.completedParticipationsInfo}}
      >
        <:default>{{this.sharedParticipationCountLastThirtyDays}}</:default>
        <:sub>
          {{this.completedParticipationsDescription}}
        </:sub>
      </PixIndicatorCard>

    </section>
  </template>
}
