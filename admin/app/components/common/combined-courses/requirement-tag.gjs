import { PixTag } from '@1024pix/nebulix-ember';
import { LinkTo } from '@ember/routing';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';

import { COMBINED_COURSE_ITEM_TYPES } from '../../../models/combined-course-blueprint';

function getItemColor(type) {
  return type === COMBINED_COURSE_ITEM_TYPES.CAMPAIGN ? 'purple' : 'blue';
}

function getItemType(type) {
  return type === COMBINED_COURSE_ITEM_TYPES.CAMPAIGN
    ? 'components.combined-course-blueprints.items.targetProfile'
    : 'components.combined-course-blueprints.items.module';
}
<template>
  <PixTag @color={{getItemColor @requirement.type}}>
    {{#if (eq @requirement.type COMBINED_COURSE_ITEM_TYPES.CAMPAIGN)}}
      <LinkTo
        @route="authenticated.target-profiles.target-profile.details"
        @model={{@requirement.value}}
        target="_blank"
        rel="noopener noreferrer"
      >
        {{t (getItemType @requirement.type)}}
        -
        {{@requirement.value}}
        -
        {{@requirement.label}}
      </LinkTo>
    {{else}}
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://app.recette.pix.fr/modules/{{@requirement.shortId}}/slug/details"
      >
        {{t (getItemType @requirement.type)}}
        -
        {{@requirement.shortId}}
        -
        {{@requirement.label}}
      </a>
    {{/if}}
  </PixTag>
</template>
