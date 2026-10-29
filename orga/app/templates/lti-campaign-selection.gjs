import { PixTable, PixTableColumn, PixTag } from '@1024pix/nebulix-ember';
import t from 'ember-intl/helpers/t';
import PageTitle from 'pix-orga/components/ui/page-title';

<template>
  <main class="lti-page">
    <PageTitle>
      <:title>{{t "pages.lti-campaigns.title"}}</:title>
    </PageTitle>
    <PixTable @variant="orga" @caption="{{t 'pages.lti-campaigns.title'}}" @data={{@model}}>
      <:columns as |campaign context|>
        <PixTableColumn @context={{context}}>
          <:header>{{t "pages.lti-campaigns.columns.campaign-name"}}</:header>
          <:cell>{{campaign.name}}</:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}}>
          <:header>{{t "pages.lti-campaigns.columns.campaign-type"}}</:header>
          <:cell>
            {{#if (eq campaign.type "ASSESSMENT")}}
              <PixTag @variant="success">Évaluer</PixTag>
            {{/if}}
            {{#if (eq campaign.type "PROFILES_COLLECTION")}}
              <PixTag @variant="secondary">Collecter</PixTag>
            {{/if}}
          </:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}}>
          <:header>{{t "pages.lti-campaigns.columns.organization"}}</:header>
          <:cell>{{campaign.organizationName}}</:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}}>
          <:header>{{t "pages.lti-campaigns.columns.code"}}</:header>
          <:cell>{{campaign.code}}</:cell>
        </PixTableColumn>
      </:columns>
    </PixTable>
  </main>
</template>
