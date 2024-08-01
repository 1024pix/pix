import { t } from 'ember-intl';

import Tabs from '../../../../tabs';
import ResultsDetails from './results-details';
import Rewards from './rewards';
import Trainings from './trainings';

<template>
  <Tabs class="evaluation-results-tabs" @ariaLabel={{t "pages.skill-review.tabs.aria-label"}} @initialTabIndex={{0}}>
    <:tabs as |Tab|>
      <Tab @index={{0}}>{{t "pages.skill-review.tabs.rewards.tab-label"}}</Tab>
      <Tab @index={{1}}>{{t "pages.skill-review.tabs.results-details.tab-label"}}</Tab>
      <Tab @index={{2}}>{{t "pages.skill-review.tabs.trainings.tab-label"}}</Tab>
    </:tabs>

    <:panels as |Panel|>
      <Panel @index={{0}}>
        <Rewards />
      </Panel>
      <Panel @index={{1}}>
        <ResultsDetails />
      </Panel>
      <Panel @index={{2}}>
        <Trainings />
      </Panel>
    </:panels>
  </Tabs>
</template>
