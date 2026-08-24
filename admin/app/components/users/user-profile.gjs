import { PixTable, PixTableColumn } from '@1024pix/nebulix-ember';
import { t } from 'ember-intl';

<template>
  <h2 class="page-section__title">Profil utilisateur</h2>

  <div class="user-profile-total-pix">
    <p class="user-profile-total-pix__score">{{@profile.pixScore}}</p>
    <p>Total pix obtenu</p>
  </div>

  {{#if @profile.scorecards}}
    <PixTable
      @variant="admin"
      @data={{@profile.scorecards}}
      @caption="Pix et niveau obtenus en fonction des compétences"
      class="user-profile-table"
    >
      <:columns as |scorecard context|>
        <PixTableColumn @context={{context}}>
          <:header>
            Compétences
          </:header>
          <:cell>
            {{scorecard.name}}
          </:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}}>
          <:header>
            Pix
          </:header>
          <:cell>
            {{scorecard.earnedPix}}
          </:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}}>
          <:header>
            Niveau
          </:header>
          <:cell>
            {{scorecard.level}}
          </:cell>
        </PixTableColumn>
      </:columns>
    </PixTable>
  {{else}}
    <div class="table__empty">{{t "common.tables.empty-result"}}</div>
  {{/if}}
</template>
