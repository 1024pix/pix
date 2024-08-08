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

  <template>
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
        <Tab @index={{2}}>{{t "pages.skill-review.tabs.trainings.tab-label"}}</Tab>
      </:tabs>

      <:panels as |Panel|>
        {{#if this.showRewardsTab}}
          <Panel @index={{0}}>
            <Rewards @badges={{@badges}} />
          </Panel>
        {{/if}}
        <Panel @index={{1}}>
          <ResultsDetails />
        </Panel>
        <Panel @index={{2}}>
          <Trainings />
        </Panel>
      </:panels>
    </Tabs>
  </template>
}
