import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import { LinkTo } from '@ember/routing';
import { t } from 'ember-intl';

<template>
  <div class="content-text content-text--small">
    <table class="table-admin">
      <thead>
        <tr>
          <th scope="col" id="user-id" class="table__column--id">{{t
              "components.users.list-items.table-headers.user-id"
            }}</th>
          <th scope="col" id="user-firstname">{{t "components.users.list-items.table-headers.user-firstname"}}</th>
          <th scope="col" id="user-lastname">{{t "components.users.list-items.table-headers.user-lastname"}}</th>
          <th scope="col" id="user-email">{{t "components.users.list-items.table-headers.user-email"}}</th>
          <th scope="col" id="user-username">{{t "components.users.list-items.table-headers.user-username"}}</th>
        </tr>
      </thead>

      {{#if @users}}
        <tbody>
          {{#each @users as |user|}}
            <tr aria-label="Informations de l'utilisateur {{user.firstName}} {{user.lastName}}">
              <td headers="user-id" class="table__column table__column--id">
                <LinkTo @route="authenticated.users.get" @model={{user.id}}>
                  {{user.id}}
                </LinkTo>
              </td>
              <td headers="user-firstname">{{user.firstName}}</td>
              <td headers="user-lastname">{{user.lastName}}</td>
              <td headers="user-email">{{user.email}}</td>
              <td headers="user-username">{{user.username}}</td>
            </tr>
          {{/each}}
        </tbody>
      {{/if}}
    </table>

    {{#unless @users}}
      <div class="table__empty">{{t "common.tables.no-result"}}</div>
    {{/unless}}
  </div>

  {{#if @users}}
    <PixPagination @pagination={{@users.meta}} />
  {{/if}}
</template>
