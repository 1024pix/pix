import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { fn } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
<template>
  {{pageTitle "Certif " @model.id " Neutralisation | Pix Admin" replace=true}}

  {{#if @controller.model.answers}}
    <PixTable
      @variant="admin"
      @data={{@controller.model.answers}}
      @caption={{t "pages.certifications.certification.neutralization.table.caption"}}
    >
      <:columns as |answer context|>
        <PixTableColumn @context={{context}}>
          <:header>
            Numéro de question
          </:header>
          <:cell>
            {{answer.order}}
          </:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}}>
          <:header>
            RecId de l'épreuve
          </:header>
          <:cell>
            {{answer.challengeId}}
          </:cell>
        </PixTableColumn>
        {{#if @controller.accessControl.hasAccessToCertificationActionsScope}}
          <PixTableColumn @context={{context}}>
            <:header>
              Action
            </:header>
            <:cell>
              {{#if answer.isNeutralized}}
                <PixButton
                  @triggerAction={{fn @controller.deneutralize answer.challengeId answer.order}}
                  @variant="secondary"
                  @loading-color="grey"
                  @size="small"
                >
                  Dé-neutraliser
                </PixButton>
              {{else}}
                <PixButton
                  @triggerAction={{fn @controller.neutralize answer.challengeId answer.order}}
                  @variant="primary"
                  @loading-color="white"
                  @size="small"
                >
                  Neutraliser
                </PixButton>
              {{/if}}
            </:cell>
          </PixTableColumn>
        {{/if}}
      </:columns>
    </PixTable>
  {{else}}
    <div class="table__empty">Aucune épreuve posée.</div>
  {{/if}}
</template>
