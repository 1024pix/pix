import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import { on } from '@ember/modifier';
import { t } from 'ember-intl';
import { not } from 'ember-truth-helpers';

import { getColumnName } from '../../helpers/import-format.js';
import Tooltip from '../certificability/tooltip';
import Header from '../table/header';
import HeaderSort from '../table/header-sort';

<template>
  <tr>
    {{#if @showCheckbox}}
      <Header class="table__column--small">
        <PixCheckbox
          @screenReaderOnly={{true}}
          @checked={{@someSelected}}
          @isIndeterminate={{not @allSelected}}
          disabled={{not @hasParticipants}}
          {{on "click" @onToggleAll}}
        ><:label>{{t "pages.organization-participants.table.column.mainCheckbox"}}</:label></PixCheckbox>
      </Header>
    {{/if}}
    <HeaderSort
      @display="left"
      @size="medium"
      @onSort={{@onSortByLastname}}
      @order={{@lastnameSort}}
      @ariaLabelDefaultSort={{t "pages.organization-participants.table.column.last-name.ariaLabelDefaultSort"}}
      @ariaLabelSortUp={{t "pages.organization-participants.table.column.last-name.ariaLabelSortUp"}}
      @ariaLabelSortDown={{t "pages.organization-participants.table.column.last-name.ariaLabelSortDown"}}
    >
      {{t "pages.organization-participants.table.column.last-name.label"}}
    </HeaderSort>
    <Header>{{t "pages.organization-participants.table.column.first-name"}}</Header>
    {{#each @customHeadings as |heading|}}
      <Header>{{t (getColumnName heading)}}</Header>
    {{/each}}
    <HeaderSort
      @size="medium"
      @align="center"
      @onSort={{@onSortByParticipationCount}}
      @order={{@participationCountOrder}}
      @ariaLabelDefaultSort={{t
        "pages.organization-participants.table.column.participation-count.ariaLabelDefaultSort"
      }}
      @ariaLabelSortUp={{t "pages.organization-participants.table.column.participation-count.ariaLabelSortUp"}}
      @ariaLabelSortDown={{t "pages.organization-participants.table.column.participation-count.ariaLabelSortDown"}}
    >
      {{t "pages.organization-participants.table.column.participation-count.label"}}
    </HeaderSort>
    <HeaderSort
      @size="medium"
      @align="center"
      @onSort={{@onSortByLatestParticipation}}
      @order={{@latestParticipationOrder}}
      @ariaLabelDefaultSort={{t
        "pages.organization-participants.table.column.latest-participation.ariaLabelDefaultSort"
      }}
      @ariaLabelSortUp={{t "pages.organization-participants.table.column.latest-participation.ariaLabelSortUp"}}
      @ariaLabelSortDown={{t "pages.organization-participants.table.column.latest-participation.ariaLabelSortDown"}}
    >
      {{t "pages.organization-participants.table.column.latest-participation.label"}}
    </HeaderSort>
    <Header @size="medium" @align="center">
      <div class="organization-participant-list-page__certificability-header">
        {{t "pages.organization-participants.table.column.is-certifiable.label"}}
        <Tooltip
          @hasComputeOrganizationLearnerCertificabilityEnabled={{@hasComputeOrganizationLearnerCertificabilityEnabled}}
        />
      </div>
    </Header>
  </tr>
</template>
