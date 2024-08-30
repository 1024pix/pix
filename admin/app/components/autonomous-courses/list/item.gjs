import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { LinkTo } from '@ember/routing';
import { t } from 'ember-intl';

import formatDate from '../../../helpers/format-date';

<template>
  <tr>
    <td>
      {{@item.id}}
    </td>
    <td>
      <LinkTo @route="authenticated.autonomous-courses.details" @model={{@item.id}}>
        {{@item.name}}
      </LinkTo>
    </td>
    <td>
      {{formatDate @item.createdAt}}
    </td>
    <td>
      {{#if @item.archivedAt}}
        <PixTag @color="grey-light">
          {{t "components.autonomous-courses.list.status.archived"}}
        </PixTag>
      {{else}}
        <PixTag @color="green-light">
          {{t "components.autonomous-courses.list.status.active"}}
        </PixTag>
      {{/if}}
    </td>
  </tr>
</template>
