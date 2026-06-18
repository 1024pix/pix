import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { LinkTo } from '@ember/routing';
import { t } from 'ember-intl';

<template>
  {{#if @attachedCertificationCenters.length}}
    <PixTable
      @variant="admin"
      @caption={{t "components.organizations.attached-certification-center.table.caption"}}
      @data={{@attachedCertificationCenters}}
    >
      <:columns as |certificationCenter context|>
        <PixTableColumn @context={{context}}>
          <:header>{{t "components.organizations.attached-certification-center.table.headers.id"}}</:header>
          <:cell>
            <LinkTo @route="authenticated.certification-centers.get" @model={{certificationCenter.id}}>
              {{certificationCenter.id}}
            </LinkTo>
          </:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}}>
          <:header>{{t "components.organizations.attached-certification-center.table.headers.name"}}</:header>
          <:cell>{{certificationCenter.name}}</:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}}>
          <:header>{{t "components.organizations.attached-certification-center.table.headers.external-id"}}</:header>
          <:cell>{{certificationCenter.externalId}}</:cell>
        </PixTableColumn>
      </:columns>
    </PixTable>
  {{else}}
    <p>{{t "components.organizations.attached-certification-center.empty"}}</p>
  {{/if}}
</template>
