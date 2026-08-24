import { PixFilterBanner, PixInput, PixPagination, PixTable, PixTableColumn } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { LinkTo } from '@ember/routing';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import StateTag from './state-tag';

export default class TrainingListSummaryItems extends Component {
  searchedId = this.args.id;
  searchedInternalTitle = this.args.internalTitle;

  <template>
    {{#if @triggerFiltering}}
      <PixFilterBanner @title={{t "common.filters.title"}}>
        <PixInput
          type="text"
          value={{this.searchedId}}
          oninput={{fn @triggerFiltering "id"}}
          aria-label="Filtrer les contenus formatifs par un id"
        >
          <:label>{{t "pages.trainings.training.list.id"}}</:label>
        </PixInput>
        <PixInput
          type="text"
          value={{this.searchedInternalTitle}}
          oninput={{fn @triggerFiltering "internalTitle"}}
          aria-label="Filtrer les contenus formatifs par un titre"
        >
          <:label>{{t "pages.trainings.training.list.internalTitle"}}</:label>
        </PixInput>
      </PixFilterBanner>
    {{/if}}

    {{#if @summaries}}
      <PixTable @variant="admin" @data={{@summaries}} @caption={{t "pages.trainings.training.list.caption"}}>
        <:columns as |summary context|>
          <PixTableColumn @context={{context}} class="table__column--medium">
            <:header>
              {{t "pages.trainings.training.list.id"}}
            </:header>
            <:cell>
              {{summary.id}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="break-word">
            <:header>
              {{t "pages.trainings.training.list.internalTitle"}}
            </:header>
            <:cell>
              <LinkTo @route="authenticated.trainings.training" @model={{summary.id}}>
                {{summary.internalTitle}}
              </LinkTo>
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="table__column--medium">
            <:header>
              {{t "pages.trainings.training.list.prerequisite"}}
            </:header>
            <:cell>
              {{summary.prerequisiteThreshold}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="table__column--medium">
            <:header>
              {{t "pages.trainings.training.list.goalThreshold"}}
            </:header>
            <:cell>
              {{summary.goalThreshold}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="table__column--medium">
            <:header>
              {{t "pages.trainings.training.list.targetProfileCount"}}
            </:header>
            <:cell>
              {{summary.targetProfilesCount}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="table__column--medium">
            <:header>
              {{t "pages.trainings.training.list.status"}}
            </:header>
            <:cell>
              <StateTag @isDisabled={{summary.isDisabled}} />
            </:cell>
          </PixTableColumn>

        </:columns>
      </PixTable>

      <PixPagination @pagination={{@summaries.meta.pagination}} />

    {{else}}
      <div class="table__empty">{{t "pages.trainings.training.list.noResult"}}</div>
    {{/if}}
  </template>
}
