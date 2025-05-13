import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { LinkTo } from '@ember/routing';
import dayjsFormat from 'ember-dayjs/helpers/dayjs-format';
import { or } from 'ember-truth-helpers';

import CampaignType from '../campaigns/type';

<template>
  <section class="no-background">
    <PixTable @variant="admin" @data={{@campaigns}} @caption="Liste des campagnes de l'organisation" class="table">
      <:columns as |campaign context|>
        <PixTableColumn @context={{context}}>
          <:header>Code</:header>
          <:cell><LinkTo @route="authenticated.campaigns.campaign" @model={{campaign.id}}>
              {{campaign.code}}
            </LinkTo></:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}}>
          <:header>Nom</:header>
          <:cell>
            <LinkTo @route="authenticated.campaigns.campaign" @model={{campaign.id}}>
              {{campaign.name}}
            </LinkTo>
          </:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}}>
          <:header>Type</:header>
          <:cell><CampaignType @campaignType={{campaign.type}} @hideLabel={{true}} /></:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}}>
          <:header>Profil cible</:header>
          <:cell>
            {{#if (or campaign.isTypeAssessment campaign.isTypeExam)}}
              <LinkTo @route="authenticated.target-profiles.target-profile.details" @model={{campaign.targetProfileId}}>
                {{campaign.targetProfileName}}
              </LinkTo>
            {{else}}
              -
            {{/if}}
          </:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}}>
          <:header>Créée le</:header>
          <:cell>{{dayjsFormat campaign.createdAt "DD/MM/YYYY"}}</:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}}>
          <:header>Créée par</:header>
          <:cell>{{campaign.creatorFirstName}} {{campaign.creatorLastName}}</:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}}>
          <:header>Propriétaire</:header>
          <:cell>{{campaign.ownerFirstName}} {{campaign.ownerLastName}}</:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}}>
          <:header>Archivée le</:header>
          <:cell>{{#if campaign.archivedAt}}
              {{dayjsFormat campaign.archivedAt "DD/MM/YYYY"}}
            {{else}}
              -
            {{/if}}</:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}}>
          <:header>Supprimée le</:header>
          <:cell>{{#if campaign.deletedAt}}
              {{dayjsFormat campaign.deletedAt "DD/MM/YYYY"}}
            {{else}}
              -
            {{/if}}</:cell>
        </PixTableColumn>
      </:columns>
    </PixTable>
    {{#unless @campaigns}}
      <div class="table__empty">Aucune campagne</div>
    {{/unless}}

    {{#if @campaigns}}
      <PixPagination @pagination={{@campaigns.meta}} />
    {{/if}}
  </section>
</template>
