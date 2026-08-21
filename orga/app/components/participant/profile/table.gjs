import { PixTable, PixTableColumn } from '@1024pix/nebulix-ember';
import { t } from 'ember-intl';

<template>
  <section>
    <PixTable
      @variant="orga"
      @caption={{t "pages.profiles-individual-results.table.title"}}
      @data={{@competences}}
      class="table"
      @onRowClick={{@onClickCampaign}}
    >
      <:columns as |competence context|>
        <PixTableColumn @context={{context}}>
          <:header>
            {{t "pages.profiles-individual-results.table.column.skill"}}
          </:header>
          <:cell>
            <span class="competences-col__border competences-col__border--{{competence.areaColor}}">
              {{competence.name}}
            </span>
          </:cell>
        </PixTableColumn>

        <PixTableColumn @context={{context}}>
          <:header>
            {{t "pages.profiles-individual-results.table.column.level"}}
          </:header>
          <:cell>
            {{competence.estimatedLevel}}
          </:cell>
        </PixTableColumn>

        <PixTableColumn @context={{context}}>
          <:header>
            {{t "pages.profiles-individual-results.table.column.pix-score"}}
          </:header>
          <:cell>
            {{competence.pixScore}}
          </:cell>
        </PixTableColumn>
      </:columns>
    </PixTable>

    {{#unless @isShared}}
      <p class="table__empty content-text">
        {{t "pages.profiles-individual-results.table.empty"}}
      </p>
    {{/unless}}
  </section>
</template>
