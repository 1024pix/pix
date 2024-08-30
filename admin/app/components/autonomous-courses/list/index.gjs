import { t } from 'ember-intl';

import ListItem from './item';

<template>
  <div class="content-text content-text--small">
    <div class="table-admin">
      <table>
        <caption class="screen-reader-only">{{t "components.autonomous-course.list.title"}}</caption>
        <thead>
          <tr>
            <th scope="col" class="table__column table__column--id">Id</th>
            <th scope="col">{{t "components.autonomous-course.list.headers.name"}}</th>
            <th scope="col" class="table__column table__medium">{{t
                "components.autonomous-course.list.headers.createdAt"
              }}</th>
            <th scope="col" class="table__column table__medium">{{t
                "components.autonomous-course.list.headers.status"
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
        <div class="table__empty">{{t "components.autonomous-course.list.no-result"}}</div>
      {{/unless}}
    </div>
  </div>
</template>
