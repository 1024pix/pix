import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { LinkTo } from '@ember/routing';
import { t } from 'ember-intl';

import formatDate from '../../helpers/format-date';

<template>
  <div class="content-text content-text--small">
    <div class="table-admin">
      <table>
        <caption class="screen-reader-only">{{t "components.autonomous-courses.list-items.table-caption"}}</caption>
        <thead>
          <tr>
            <th scope="col" id="autonomous-course-id" class="table__column--id">
              {{t "components.autonomous-courses.list-items.table-headers.autonomous-course-id"}}</th>
            <th scope="col" id="autonomous-course-name">
              {{t "components.autonomous-courses.list-items.table-headers.autonomous-course-name"}}</th>
            <th scope="col" id="autonomous-course-creation-date" class="table__column--medium">
              {{t "components.autonomous-courses.list-items.table-headers.autonomous-course-creation-date"}}</th>
            <th scope="col" id="autonomous-course-status" class="table__column--medium">
              {{t "components.autonomous-courses.list-items.table-headers.autonomous-course-status"}}</th>
          </tr>
        </thead>

        {{#if @items}}
          <tbody>
            {{#each @items as |autonomousCourseListItem|}}
              <tr>
                <td headers="autonomous-course-id">
                  {{autonomousCourseListItem.id}}
                </td>
                <td headers="autonomous-course-name">
                  <LinkTo
                    @route="authenticated.autonomous-courses.autonomous-course"
                    @model={{autonomousCourseListItem.id}}
                  >
                    {{autonomousCourseListItem.name}}
                  </LinkTo>
                </td>
                <td headers="autonomous-course-creation-date">
                  {{formatDate autonomousCourseListItem.createdAt}}
                </td>
                <td headers="autonomous-course-status">
                  {{#if autonomousCourseListItem.archivedAt}}
                    <PixTag @color="grey-light">
                      {{t "common.words.archived"}}
                    </PixTag>
                  {{else}}
                    <PixTag @color="green-light">
                      {{t "common.words.active"}}
                    </PixTag>
                  {{/if}}
                </td>
              </tr>
            {{/each}}
          </tbody>
        {{/if}}
      </table>

      {{#unless @items}}
        <div class="table__empty">{{t "common.tables.no-result"}}</div>
      {{/unless}}
    </div>
  </div>
</template>
