import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import dayjsFormat from 'ember-dayjs/helpers/dayjs-format';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';

import TableHeader from '../table/header';
import TablePaginationControl from '../table/pagination-control';
import CampaignType from './detail/type';
import CampaignFilters from './filter/campaign-filters';

export default class List extends Component {
  @service intl;

  get caption() {
    if (this.args.allCampaignsContext) {
      return this.intl.t('pages.campaigns-list.table.description-all-campaigns');
    } else {
      return this.intl.t('pages.campaigns-list.table.description-my-campaigns');
    }
  }

  get labels() {
    return {
      ASSESSMENT: 'components.campaign.type.explanation.ASSESSMENT',
      PROFILES_COLLECTION: 'components.campaign.type.explanation.PROFILES_COLLECTION',
    };
  }

  @action
  stopPropagation(event) {
    event.stopPropagation();
  }

  <template>
    <section class="campaign-list">
      <CampaignFilters
        @ownerNameFilter={{@ownerNameFilter}}
        @nameFilter={{@nameFilter}}
        @statusFilter={{@statusFilter}}
        @onFilter={{@onFilter}}
        @onClearFilters={{@onClear}}
        @numResults={{@campaigns.meta.rowCount}}
        @listOnlyCampaignsOfCurrentUser={{@listOnlyCampaignsOfCurrentUser}}
      />

      <div class="panel">
        <table class="table content-text content-text--small">
          <caption class="screen-reader-only">{{this.caption}}</caption>
          <colgroup class="table__column">
            <col class="table__column--wide" />
            <col class="table__column--small" />
            {{#unless @listOnlyCampaignsOfCurrentUser}}
              <col class="table__column--small hide-on-mobile" />
            {{/unless}}
            <col class="table__column--small hide-on-mobile" />
            <col class="table__column--small hide-on-mobile" />
            <col class="table__column--small hide-on-mobile" />
          </colgroup>
          <thead>
            <tr>
              <TableHeader>{{t "pages.campaigns-list.table.column.name"}}</TableHeader>
              <TableHeader>{{t "pages.campaigns-list.table.column.code"}}</TableHeader>
              {{#unless @listOnlyCampaignsOfCurrentUser}}
                <TableHeader class="hide-on-mobile">{{t "pages.campaigns-list.table.column.created-by"}}</TableHeader>
              {{/unless}}
              <TableHeader class="hide-on-mobile">{{t "pages.campaigns-list.table.column.created-on"}}</TableHeader>
              <TableHeader class="hide-on-mobile">{{t "pages.campaigns-list.table.column.participants"}}</TableHeader>
              <TableHeader class="hide-on-mobile">{{t "pages.campaigns-list.table.column.results"}}</TableHeader>
            </tr>
          </thead>

          <tbody>
            {{#each @campaigns as |campaign|}}
              <tr {{on "click" (fn @onClickCampaign campaign.id)}} class="tr--clickable">
                <td class="table__column">
                  <span class="campaign-list__campaign-link-cell">
                    <CampaignType @labels={{this.labels}} @campaignType={{campaign.type}} @hideLabel={{true}} />
                    <LinkTo @route="authenticated.campaigns.campaign" @model={{campaign.id}}>
                      {{campaign.name}}
                    </LinkTo>
                  </span>
                </td>
                <td class="table__column--small" {{on "click" this.stopPropagation}}>{{campaign.code}}</td>
                {{#unless @listOnlyCampaignsOfCurrentUser}}
                  <td class="hide-on-mobile">{{campaign.ownerFullName}}</td>
                {{/unless}}
                <td class="hide-on-mobile">{{dayjsFormat campaign.createdAt "DD/MM/YYYY" allow-empty=true}}</td>
                <td class="hide-on-mobile">{{campaign.participationsCount}}</td>
                <td class="hide-on-mobile">{{campaign.sharedParticipationsCount}}</td>
              </tr>
            {{/each}}
          </tbody>
        </table>
        {{#if (eq @campaigns.length 0)}}
          <p class="table__empty content-text">
            {{t "pages.campaigns-list.table.empty"}}
          </p>
        {{/if}}
      </div>

      <TablePaginationControl @pagination={{@campaigns.meta}} />
    </section>
  </template>
}
