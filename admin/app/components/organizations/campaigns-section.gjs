import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import { LinkTo } from '@ember/routing';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import dayjsFormat from 'ember-dayjs/helpers/dayjs-format';
import { eq } from 'ember-truth-helpers';

<template>
  <section class="page-section">
    <header class="page-section__header">
      <h2 class="page-section__title">Liste des campagnes</h2>
    </header>
    <div class="content-text content-text--small">
      <div class="table-admin">
        <table>
          <thead>
            <tr>
              <th class="table__column--medium">Code</th>
              <th>Nom</th>
              <th class="table__column--small">Type</th>
              <th>Profil cible</th>
              <th class="table__column--medium">Créée le</th>
              <th>Créée par</th>
              <th>Propriétaire</th>
              <th class="table__column--medium">Archivée le</th>
              <th class="table__column--medium">Supprimée le</th>
            </tr>
          </thead>

          {{#if @campaigns}}
            <tbody>
              {{#each @campaigns as |campaign|}}
                <tr aria-label="campagne">
                  <td>
                    <LinkTo @route="authenticated.campaigns.campaign" @model={{campaign.id}}>
                      {{campaign.code}}
                    </LinkTo>
                  </td>
                  <td>{{campaign.name}}</td>
                  <td>
                    {{#if (eq campaign.type "ASSESSMENT")}}
                      <div title="Évaluation">
                        <FaIcon class="campaign-type__icon-assessment" @icon="tachometer" @prefix="fapix" />
                      </div>
                    {{else}}
                      <div title="Collecte de profils">
                        <FaIcon class="campaign-type__icon-profile-collection" @icon="person-export" @prefix="fapix" />
                      </div>
                    {{/if}}
                  </td>
                  <td>
                    {{#if (eq campaign.type "ASSESSMENT")}}
                      <LinkTo
                        @route="authenticated.target-profiles.target-profile.details"
                        @model={{campaign.targetProfileId}}
                      >
                        {{campaign.targetProfileName}}
                      </LinkTo>
                    {{else}}
                      -
                    {{/if}}
                  </td>
                  <td>{{dayjsFormat campaign.createdAt "DD/MM/YYYY"}}</td>
                  <td>{{campaign.creatorFirstName}} {{campaign.creatorLastName}}</td>
                  <td>{{campaign.ownerFirstName}} {{campaign.ownerLastName}}</td>
                  <td>
                    {{#if campaign.archivedAt}}
                      {{dayjsFormat campaign.archivedAt "DD/MM/YYYY"}}
                    {{else}}
                      -
                    {{/if}}
                  </td>
                  <td>
                    {{#if campaign.deletedAt}}
                      {{dayjsFormat campaign.deletedAt "DD/MM/YYYY"}}
                    {{else}}
                      -
                    {{/if}}
                  </td>
                </tr>
              {{/each}}
            </tbody>
          {{/if}}
        </table>

        {{#unless @campaigns}}
          <div class="table__empty">Aucune campagne</div>
        {{/unless}}
      </div>
      {{#if @campaigns}}
        <PixPagination @pagination={{@campaigns.meta}} />
      {{/if}}
    </div>
  </section>
</template>
