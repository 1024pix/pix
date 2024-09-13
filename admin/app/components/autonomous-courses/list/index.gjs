import { t } from 'ember-intl';

import ListItem from './item';

<template>
  <div class="content-text content-text--small">
    <div class="table-admin">
      <table>
        <caption class="screen-reader-only">{{t "components.autonomous-courses.list.title"}}</caption>
        <thead>
          <tr>
            <th scope="col" class="table__column table__column--id">{{t
                "components.autonomous-courses.list.headers.id"
              }}</th>
            <th scope="col">{{t "components.autonomous-courses.list.headers.name"}}</th>
            <th scope="col" class="table__column table__medium">{{t
                "components.autonomous-courses.list.headers.createdAt"
              }}</th>
            <th scope="col" class="table__column table__medium">{{t
                "components.autonomous-courses.list.headers.status"
              }}</th>
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
        <div class="table__empty">{{t "components.autonomous-courses.list.no-result"}}</div>
      {{/unless}}
    </div>
  </div>
</template>
