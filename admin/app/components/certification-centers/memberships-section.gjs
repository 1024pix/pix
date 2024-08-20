import MembershipItem from './membership-item';

<template>
  <section class="page-section">

    <header class="page-section__header">
      <h2 class="page-section__title">Membres</h2>
    </header>

    <div class="content-text content-text--small">
      <div class="table-admin">
        <table>
          <thead>
            <tr>
              <th class="table__column table__column--id">ID Utilisateur</th>
              <th class="table__column table__column--wide">Prénom</th>
              <th class="table__column table__column--wide">Nom</th>
              <th class="table__column table__column--wide">Adresse e-mail</th>
              <th class="table__column table__column--wide">Rôle</th>
              <th class="table__column table__column--wide">Date de rattachement</th>
              <th class="table__column table__column--wide">Actions</th>
            </tr>
          </thead>

          {{#if @certificationCenterMemberships}}
            <tbody>
              {{#each @certificationCenterMemberships as |certificationCenterMembership|}}
                <MembershipItem
                  @certificationCenterMembership={{certificationCenterMembership}}
                  @disableCertificationCenterMembership={{@disableCertificationCenterMembership}}
                  @onCertificationCenterMembershipRoleChange={{@onCertificationCenterMembershipRoleChange}}
                />
              {{/each}}
            </tbody>
          {{/if}}
        </table>

        {{#unless @certificationCenterMemberships}}
          <div class="table__empty">Aucun résultat</div>
        {{/unless}}
      </div>
    </div>
  </section>
</template>
