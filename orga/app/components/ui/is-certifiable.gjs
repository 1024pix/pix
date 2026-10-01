import { PixTag } from '@1024pix/nebulix-ember';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';

<template>
  {{#if (eq @isCertifiable null)}}
    {{t "pages.sco-organization-participants.table.column.is-certifiable.not-available"}}
  {{else if @isCertifiable}}
    <PixTag @color="green-light">
      {{t "pages.sco-organization-participants.table.column.is-certifiable.eligible"}}
    </PixTag>
  {{else}}
    <PixTag @color="yellow-light organization-participant__tag">
      {{t "pages.sco-organization-participants.table.column.is-certifiable.non-eligible"}}
    </PixTag>
  {{/if}}
</template>
