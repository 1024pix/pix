import pageTitle from 'ember-page-title/helpers/page-title';
import AddMember from 'pix-admin/components/team/add-member';
import List from 'pix-admin/components/team/list';
<template>
  {{pageTitle "Équipe"}}

  <header>
    <h1>Équipe</h1>
  </header>

  <main class="page-body">
    <section class="page-section">
      <AddMember @roles={{@controller.roles}} />
    </section>

    <section class="page-section">
      <List @members={{@model}} @roles={{@controller.roles}} @refreshValues={{@controller.refresh}} />
    </section>
  </main>
</template>
