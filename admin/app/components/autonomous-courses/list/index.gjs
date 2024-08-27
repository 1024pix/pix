import ListItem from './item';

<template>
  <div class="content-text content-text--small">
    <div class="table-admin">
      <table>
        <caption class="screen-reader-only">Liste des parcours autonomes</caption>
        <thead>
          <tr>
            <th scope="col" class="table__column table__column--id">Id</th>
            <th scope="col">Nom</th>
            <th scope="col" class="table__column table__medium">Date de création</th>
            <th scope="col" class="table__column table__medium">Statut</th>
          </tr>
        </thead>

        {{#if @items}}
          <tbody>
            {{#each @items as |autonomousCourseListItem|}}
              <ListItem @item={{autonomousCourseListItem}} />
            {{/each}}
          </tbody>
        {{/if}}
      </table>

      {{#unless @items}}
        <div class="table__empty">Aucun résultat</div>
      {{/unless}}
    </div>
  </div>
</template>
