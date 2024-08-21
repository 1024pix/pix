import { LinkTo } from '@ember/routing';
import dayjsFormat from 'ember-dayjs/helpers/dayjs-format';

<template>
  <section class="page-section">
    <div class="content-text content-text--small">
      <h2 class="complementary-certification-details__history-title">
        Historique des profils cibles rattachés
      </h2>
      <div class="table-admin">
        <table>
          <thead>
            <tr>
              <th>Nom du profil cible</th>
              <th>Date de rattachement</th>
              <th>Date de détachement</th>
            </tr>
          </thead>
          <tbody>
            {{#each @targetProfilesHistory as |targetProfileHistory|}}
              <tr>
                <td>
                  <LinkTo
                    @route="authenticated.target-profiles.target-profile"
                    @model={{targetProfileHistory.id}}
                    class="complementary-certification-details-target-profile__link"
                  >
                    {{targetProfileHistory.name}}
                  </LinkTo>
                </td>
                <td>{{dayjsFormat targetProfileHistory.attachedAt "DD/MM/YYYY"}}</td>
                <td>
                  {{if targetProfileHistory.detachedAt (dayjsFormat targetProfileHistory.detachedAt "DD/MM/YYYY") "-"}}
                </td>
              </tr>
            {{/each}}
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
