import { PixTable, PixTableColumn } from '@1024pix/nebulix-ember';
import { LinkTo } from '@ember/routing';
import { t } from 'ember-intl';

<template>
  {{#if @withRequiredActionSessions}}
    <PixTable
      @variant="admin"
      @data={{@withRequiredActionSessions}}
      @caption={{t "pages.sessions.table.required-actions.caption"}}
    >
      <:columns as |row withRequiredActionSession|>
        <PixTableColumn @context={{withRequiredActionSession}} class="table__column--medium">
          <:header>
            {{t "pages.sessions.table.required-actions.headers.id"}}
          </:header>
          <:cell>
            <LinkTo @route="authenticated.sessions.session" @model={{row.id}}>
              {{row.id}}
            </LinkTo>
          </:cell>
        </PixTableColumn>
        <PixTableColumn @context={{withRequiredActionSession}}>
          <:header>
            {{t "pages.sessions.table.required-actions.headers.certification-name"}}
          </:header>
          <:cell>
            {{row.certificationCenterName}}
          </:cell>
        </PixTableColumn>
        <PixTableColumn @context={{withRequiredActionSession}}>
          <:header>
            {{t "pages.sessions.table.required-actions.headers.session-date"}}
          </:header>
          <:cell>
            {{row.printableDateAndTime}}
          </:cell>
        </PixTableColumn>
        <PixTableColumn @context={{withRequiredActionSession}}>
          <:header>
            {{t "pages.sessions.table.required-actions.headers.finalization-date"}}
          </:header>
          <:cell>
            {{row.printableFinalizationDate}}
          </:cell>
        </PixTableColumn>
        <PixTableColumn @context={{withRequiredActionSession}}>
          <:header>
            {{t "pages.sessions.table.required-actions.headers.assigned-officer-name"}}
          </:header>
          <:cell>
            {{#if row.assignedCertificationOfficerName}}
              {{row.assignedCertificationOfficerName}}
            {{else}}
              -
            {{/if}}
          </:cell>
        </PixTableColumn>
      </:columns>
    </PixTable>
  {{else}}
    <div class="table__empty">{{t "common.tables.empty-result"}}</div>
  {{/if}}
</template>
