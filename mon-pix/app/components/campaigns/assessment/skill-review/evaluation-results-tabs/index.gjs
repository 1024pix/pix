import Component from '@glimmer/component';
import { t } from 'ember-intl';

import Tabs from '../../../../tabs';
import ResultsDetails from './results-details';
import Rewards from './rewards';
import Trainings from './trainings';

export default class EvaluationResultsTabs extends Component {
  get showRewardsTab() {
    return this.args.badges.length > 0;
  }

  get initialTabIndex() {
    return this.showRewardsTab ? 0 : 1;
  }

  get showTrainingsTab() {
    return this.args.trainings.length > 0;
  }

  get showTabs() {
    return this.showRewardsTab || this.showTrainingsTab;
  }

  <template>
    {{#if this.showTabs}}
      <Tabs
        class="evaluation-results-tabs"
        @ariaLabel={{t "pages.skill-review.tabs.aria-label"}}
        @initialTabIndex={{this.initialTabIndex}}
      >
        <:tabs as |Tab|>
          {{#if this.showRewardsTab}}
            <Tab @index={{0}}>{{t "pages.skill-review.tabs.rewards.tab-label"}}</Tab>
          {{/if}}
          <Tab @index={{1}}>{{t "pages.skill-review.tabs.results-details.tab-label"}}</Tab>
          {{#if this.showTrainingsTab}}
            <Tab @index={{2}}>{{t "pages.skill-review.tabs.trainings.tab-label"}}</Tab>
          {{/if}}
        </:tabs>

        <:panels as |Panel|>
          {{#if this.showRewardsTab}}
            <Panel @index={{0}}>
              <Rewards @badges={{@badges}} />
            </Panel>
          {{/if}}
          <Panel @index={{1}}>
            <ResultsDetails @competenceResults={{@competenceResults}} @totalStage={{@totalStage}} />
          </Panel>
          {{#if this.showTrainingsTab}}
            <Panel @index={{2}}>
              <Trainings
                @trainings={{@trainings}}
                @isParticipationShared={{@isParticipationShared}}
                @campaignParticipationResultId={{@campaignParticipationResultId}}
              />
            </Panel>
          {{/if}}
        </:panels>
      </Tabs>
    {{else}}
      <section class="evaluation-results-tabs">
        <ResultsDetails @competenceResults={{@competenceResults}} @totalStage={{@totalStage}} />
      </section>
    {{/if}}
  </template>
}
