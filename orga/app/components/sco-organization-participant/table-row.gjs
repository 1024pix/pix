import { PixCheckbox, PixTableColumn } from '@1024pix/nebulix-ember';
import { fn, get } from '@ember/helper';
import { on } from '@ember/modifier';
import { LinkTo } from '@ember/routing';
import { formatDate, t } from 'ember-intl';
import { not } from 'ember-truth-helpers';

import { CONNECTION_TYPES } from '../../helpers/connection-types';
import { USER_ACCOUNT_BLOCKING_TYPES } from '../../helpers/user-account-blocking-types';
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
          <:label>{{t "pages.sco-organization-participants.table.column.mainCheckbox"}}</:label></PixCheckbox>
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
  <PixTableColumn
    @context={{@context}}
    @onSort={{@onSortByLastname}}
    @sortOrder={{@lastnameSort}}
    @ariaLabelDefaultSort={{t "pages.organization-participants.table.column.last-name.ariaLabelDefaultSort"}}
    @ariaLabelSortAsc={{t "pages.organization-participants.table.column.last-name.ariaLabelSortUp"}}
    @ariaLabelSortDesc={{t "pages.organization-participants.table.column.last-name.ariaLabelSortDown"}}
  >
    <:header>{{t "pages.organization-participants.table.column.last-name.label"}}</:header>
    <:cell>
      <LinkTo @route="authenticated.sco-organization-participants.sco-organization-participant" @model={{@student.id}}>
        {{@student.lastName}}
      </LinkTo>
    </:cell>
  </PixTableColumn>
  <PixTableColumn @context={{@context}}>
    <:header>{{t "pages.sco-organization-participants.table.column.first-name"}}</:header>
    <:cell>{{@student.firstName}}</:cell>
  </PixTableColumn>
  <PixTableColumn @context={{@context}}>
    <:header>{{t "pages.sco-organization-participants.table.column.date-of-birth"}}</:header>
    <:cell>{{formatDate @student.birthdate}}</:cell>
  </PixTableColumn>
  <PixTableColumn
    @context={{@context}}
    @onSort={{@onSortByDivision}}
    @sortOrder={{@divisionSort}}
    @ariaLabelDefaultSort={{t "pages.sco-organization-participants.table.column.division.ariaLabelDefaultSort"}}
    @ariaLabelSortAsc={{t "pages.sco-organization-participants.table.column.division.ariaLabelSortUp"}}
    @ariaLabelSortDesc={{t "pages.sco-organization-participants.table.column.division.ariaLabelSortDown"}}
  >
    <:header>{{t "pages.sco-organization-participants.table.column.division.label"}}</:header>
    <:cell>{{@student.division}}</:cell>
  </PixTableColumn>
  <PixTableColumn @context={{@context}}>
    <:header>{{t "pages.sco-organization-participants.table.column.login-method"}}</:header>
    <:cell>
      {{#if @student.isTemporarilyBlocked}}
        <p class="sco-organization-participant-list-page__user-account-temporarily-blocked">{{t
            (get USER_ACCOUNT_BLOCKING_TYPES "temporarily_blocked")
          }}</p>
      {{else if @student.isBlocked}}
        <p class="sco-organization-participant-list-page__user-account-blocked">{{t
            (get USER_ACCOUNT_BLOCKING_TYPES "blocked")
          }}</p>
      {{/if}}
      {{#each @student.authenticationMethods as |authenticationMethod|}}
        <p>{{t (get CONNECTION_TYPES authenticationMethod)}}</p>
      {{/each}}
    </:cell>
  </PixTableColumn>
  <PixTableColumn
    @context={{@context}}
    @type="number"
    @onSort={{@onSortByParticipationCount}}
    @sortOrder={{@participationCountOrder}}
    @ariaLabelDefaultSort={{t
      "pages.sco-organization-participants.table.column.participation-count.ariaLabelDefaultSort"
    }}
    @ariaLabelSortAsc={{t "pages.sco-organization-participants.table.column.participation-count.ariaLabelSortUp"}}
    @ariaLabelSortDesc={{t "pages.sco-organization-participants.table.column.participation-count.ariaLabelSortDown"}}
  >
    <:header>{{t "pages.sco-organization-participants.table.column.participation-count.label"}}</:header>
    <:cell>{{@student.participationCount}}</:cell>
  </PixTableColumn>
  <PixTableColumn @context={{@context}}>
    <:header>{{t "pages.sco-organization-participants.table.column.last-participation-date"}}</:header>
    <:cell>{{#if @student.lastParticipationDate}}
        <div class="organization-participant__align-element">
          <span>{{formatDate @student.lastParticipationDate format="L"}}</span>
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
      {{t "pages.sco-organization-participants.table.column.is-certifiable.label"}}
      <Tooltip
        @hasComputeOrganizationLearnerCertificabilityEnabled={{@hasComputeOrganizationLearnerCertificabilityEnabled}}
      />
    </:header>
    <:cell>
      <Cell
        @hideCertifiableDate={{@hideCertifiableDate}}
        @certifiableAt={{@student.certifiableAt}}
        @isCertifiable={{@student.isCertifiable}}
      />
    </:cell>
  </PixTableColumn>
  <PixTableColumn @context={{@context}}>
    <:header>{{t "common.actions.global"}}</:header>
    <:cell>{{#if @student.isAssociated}}
        <IconTrigger
          @icon="moreVert"
          @dropdownButtonClass="organization-participant__dropdown-button"
          @dropdownContentClass="organization-participant__dropdown-content"
          @ariaLabel={{t "pages.sco-organization-participants.actions.show-actions"}}
        >
          <Item @onClick={{fn @openAuthenticationMethodModal @student}}>
            {{t "pages.sco-organization-participants.actions.manage-account"}}
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
