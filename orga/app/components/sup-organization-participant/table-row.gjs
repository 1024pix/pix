import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { LinkTo } from '@ember/routing';
import dayjsFormat from 'ember-dayjs/helpers/dayjs-format';
import { t } from 'ember-intl';
import { not } from 'ember-truth-helpers';

import Cell from '../certificability/cell';
import Tooltip from '../certificability/tooltip';
import IconTrigger from '../dropdown/icon-trigger';
import Item from '../dropdown/item';
import LastParticipationDateTooltip from '../ui/last-participation-date-tooltip';

<template>
  {{#if @showCheckbox}}
    <PixTableColumn @context={{@context}}>
      <:header>
        <PixCheckbox
          @screenReaderOnly={{true}}
          @checked={{@someSelected}}
          @isIndeterminate={{not @allSelected}}
          disabled={{not @hasStudents}}
          {{on "click" @onToggleAll}}
        >
          <:label>{{t "pages.organization-participants.table.column.mainCheckbox"}}</:label></PixCheckbox>
      </:header>
      <:cell>
        <PixCheckbox @screenReaderOnly={{true}} @checked={{@isStudentSelected}} {{on "click" @onToggleStudent}}>
          <:label>
            {{t
              "pages.sco-organization-participants.table.column.checkbox"
              firstname=@student.firstName
              lastname=@student.lastName
            }}</:label>
        </PixCheckbox>
      </:cell>
    </PixTableColumn>
  {{/if}}

  <PixTableColumn @context={{@context}}>
    <:header>{{t "pages.sup-organization-participants.table.column.student-number"}}</:header>
    <:cell>{{@student.studentNumber}}</:cell>
  </PixTableColumn>
  <PixTableColumn
    @context={{@context}}
    @onSort={{@sortByLastname}}
    @sortOrder={{@lastnameSort}}
    @ariaLabelDefaultSort={{t "pages.organization-participants.table.column.last-name.ariaLabelDefaultSort"}}
    @ariaLabelSortAsc={{t "pages.organization-participants.table.column.last-name.ariaLabelSortUp"}}
    @ariaLabelSortDesc={{t "pages.organization-participants.table.column.last-name.ariaLabelSortDown"}}
  >
    <:header>{{t "pages.organization-participants.table.column.last-name.label"}}</:header>
    <:cell><LinkTo
        @route="authenticated.sup-organization-participants.sup-organization-participant"
        @model={{@student.id}}
      >
        {{@student.lastName}}
      </LinkTo></:cell>
  </PixTableColumn>
  <PixTableColumn @context={{@context}}>
    <:header>{{t "pages.sup-organization-participants.table.column.first-name"}}</:header>
    <:cell>{{@student.firstName}}</:cell>
  </PixTableColumn>
  <PixTableColumn @context={{@context}}>
    <:header>{{t "pages.sup-organization-participants.table.column.date-of-birth"}}</:header>
    <:cell>{{dayjsFormat @student.birthdate "DD/MM/YYYY"}}</:cell>
  </PixTableColumn>
  <PixTableColumn @context={{@context}}>
    <:header>{{t "pages.sup-organization-participants.table.column.group"}}</:header>
    <:cell>{{@student.group}}</:cell>
  </PixTableColumn>
  <PixTableColumn
    @context={{@context}}
    @type="number"
    @onSort={{@sortByParticipationCount}}
    @sortOrder={{@participationCountOrder}}
    @ariaLabelDefaultSort={{t
      "pages.sup-organization-participants.table.column.participation-count.ariaLabelDefaultSort"
    }}
    @ariaLabelSortAsc={{t "pages.sup-organization-participants.table.column.participation-count.ariaLabelSortUp"}}
    @ariaLabelSortDesc={{t "pages.sup-organization-participants.table.column.participation-count.ariaLabelSortDown"}}
  >
    <:header>{{t "pages.sup-organization-participants.table.column.participation-count.label"}}</:header>
    <:cell>{{@student.participationCount}}</:cell>
  </PixTableColumn>
  <PixTableColumn @context={{@context}}>
    <:header>{{t "pages.sup-organization-participants.table.column.last-participation-date"}}</:header>
    <:cell>{{#if @student.lastParticipationDate}}
        <div class="organization-participant__align-element">
          <span>{{dayjsFormat @student.lastParticipationDate "DD/MM/YYYY" allow-empty=true}}</span>
          <LastParticipationDateTooltip
            @id={{@index}}
            @campaignName={{@student.campaignName}}
            @campaignType={{@student.campaignType}}
            @participationStatus={{@student.participationStatus}}
          />
        </div>
      {{/if}}</:cell>
  </PixTableColumn>
  <PixTableColumn @context={{@context}}>
    <:header>
      {{t "pages.sup-organization-participants.table.column.is-certifiable.label"}}
      <Tooltip
        @hasComputeOrganizationLearnerCertificabilityEnabled={{@hasComputeOrganizationLearnerCertificabilityEnabled}}
      />
    </:header>
    <:cell>
      <div class="organization-participant__align-element organization-participant__align-element--column">
        <Cell
          @hideCertifiableDate={{@hideCertifiableDate}}
          @certifiableAt={{@student.certifiableAt}}
          @isCertifiable={{@student.isCertifiable}}
        />
      </div>
    </:cell>
  </PixTableColumn>
  <PixTableColumn @context={{@context}}>
    <:header>{{t "common.actions.global"}}</:header>
    <:cell>{{#if @isAdminInOrganization}}
        <IconTrigger
          @icon="moreVert"
          @dropdownButtonClass="organization-participant-list-page__dropdown-button"
          @dropdownContentClass="organization-participant-list-page__dropdown-content"
          @ariaLabel={{t "pages.sup-organization-participants.actions.show-actions"}}
        >
          <Item @onClick={{fn @openEditStudentNumberModal @student}}>
            {{t "pages.sup-organization-participants.actions.edit-student-number"}}
          </Item>
          {{#if @canEditLearnerName}}
            <Item @onClick={{fn @openEditNameModal @student}}>
              {{t "components.ui.edit-participant-name-modal.label"}}
            </Item>
          {{/if}}
        </IconTrigger>
      {{/if}}</:cell>
  </PixTableColumn>
</template>
