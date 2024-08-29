import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import { fn } from '@ember/helper';
import { LinkTo } from '@ember/routing';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import StateTag from './state-tag';

export default class TrainingListSummaryItems extends Component {
  searchedId = this.args.id;
  searchedTitle = this.args.title;

  <template>
    <div class="content-text content-text--small">
      <div class="table-admin">
        <table>
          <caption class="screen-reader-only">{{t "components.trainings.list-summary-items.table-caption"}}</caption>
          <thead>
            <tr>
              <th id="training-id" scope="col" class="table__column--id">{{t
                  "components.trainings.list-summary-items.table-headers.training-id"
                }}</th>
              <th id="training-title" scope="col">{{t
                  "components.trainings.list-summary-items.table-headers.training-title"
                }}</th>
              <th id="training-prerequisite-threshold" scope="col" class="table__column--medium">{{t
                  "components.trainings.list-summary-items.table-headers.training-prerequisite-threshold"
                }}</th>
              <th id="training-goal-threshold" scope="col" class="table__column--medium">{{t
                  "components.trainings.list-summary-items.table-headers.training-goal-threshold"
                }}</th>
              <th id="training-target-profile-count" scope="col" class="table__column--medium">{{t
                  "components.trainings.list-summary-items.table-headers.training-target-profile-count"
                }}</th>
              <th id="training-state" scope="col" class="table__column--medium">{{t
                  "components.trainings.list-summary-items.table-headers.training-state"
                }}</th>
            </tr>
            {{#if @triggerFiltering}}
              <tr>
                <td class="table__column table__column--id">
                  <PixInput
                    type="text"
                    value={{this.searchedId}}
                    oninput={{fn @triggerFiltering "id"}}
                    aria-label={{t "components.trainings.list-summary-items.labels.filter-by-id"}}
                  />
                </td>
                <td>
                  <PixInput
                    type="text"
                    value={{this.searchedTitle}}
                    oninput={{fn @triggerFiltering "title"}}
                    aria-label={{t "components.trainings.list-summary-items.labels.filter-by-title"}}
                  />
                </td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            {{/if}}
          </thead>

          {{#if @summaries}}
            <tbody>
              {{#each @summaries as |summary|}}
                <tr aria-label="Contenu formatif">
                  <td headers="training-id" class="table__column table__column--id">{{summary.id}}</td>
                  <td headers="training-title">
                    <LinkTo @route="authenticated.trainings.training" @model={{summary.id}}>
                      {{summary.title}}
                    </LinkTo>
                  </td>
                  <td headers="training-prerequisite-threshold">
                    {{summary.prerequisiteThreshold}}
                  </td>
                  <td headers="training-goal-threshold">
                    {{summary.goalThreshold}}
                  </td>
                  <td headers="training-target-profiles-count">
                    {{summary.targetProfilesCount}}
                  </td>
                  <td headers="training-state">
                    <StateTag @isDisabled={{summary.isDisabled}} />
                  </td>
                </tr>
              {{/each}}
            </tbody>
          {{/if}}
        </table>

        {{#unless @summaries}}
          <div class="table__empty">{{t "common.tables.no-result"}}</div>
        {{/unless}}
      </div>
    </div>

    {{#if @summaries}}
      <PixPagination @pagination={{@summaries.meta.pagination}} />
    {{/if}}
  </template>
}
