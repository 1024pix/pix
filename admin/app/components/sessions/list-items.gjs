import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { LinkTo } from '@ember/routing';
import { t } from 'ember-intl';
import formatDate from 'ember-intl/helpers/format-date';
import FilterBanner from 'pix-admin/components/sessions/filter-banner';

<template>
  <div class="session-list">
    <FilterBanner @filters={{@filters}} @triggerFiltering={{@triggerFiltering}} @onChangeFilter={{@onChangeFilter}} />

    {{#if @sessions}}
      <PixTable @variant="admin" @data={{@sessions}} @caption={{t "pages.sessions.table.caption"}}>
        <:columns as |session context|>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "pages.sessions.table.headers.id"}}
            </:header>
            <:cell>
              <LinkTo @route="authenticated.sessions.session" @model={{session.id}}>
                {{session.id}}
              </LinkTo>
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "pages.sessions.table.headers.certification-name"}}
            </:header>
            <:cell>
              {{session.certificationCenterName}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="break-word">
            <:header>
              {{t "pages.sessions.table.headers.external-id"}}
            </:header>
            <:cell>
              {{session.certificationCenterExternalId}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "pages.sessions.table.headers.type"}}
            </:header>
            <:cell>
              {{#if session.certificationCenterType}}
                {{session.certificationCenterType}}
              {{else}}
                -
              {{/if}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "pages.sessions.table.headers.session-date"}}
            </:header>
            <:cell>
              {{#if session.date}}
                {{formatDate session.date}}
              {{/if}}
              à
              {{session.time}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "pages.sessions.table.headers.status"}}
            </:header>
            <:cell>
              {{session.displayStatus}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "pages.sessions.table.headers.finalization-session-date"}}
            </:header>
            <:cell>
              {{#if session.finalizedAt}}
                {{formatDate session.finalizedAt}}
              {{/if}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "pages.sessions.table.headers.publication-session-date"}}
            </:header>
            <:cell>
              {{#if session.publishedAt}}
                {{formatDate session.publishedAt}}
              {{/if}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "pages.sessions.table.headers.version"}}
            </:header>
            <:cell>
              {{session.version}}
            </:cell>
          </PixTableColumn>
        </:columns>
      </PixTable>

      <PixPagination @pagination={{@sessions.meta}} />
    {{else}}
      <div class="table__empty">{{t "common.tables.empty-result"}}</div>
    {{/if}}
  </div>
</template>
