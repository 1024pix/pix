import PixMultiSelect from '@1024pix/pix-ui/components/pix-multi-select';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { cell, resource, resourceFactory } from 'ember-resources';

import { IsLoading } from '../../resources/IsLoading.js';

function options(divisions) {
  return divisions?.map(({ name }) => ({ value: name, label: name }));
}

<template>
  {{#if (IsLoading @model.divisions)}}
    <div class="divisions-filter--is-loading placeholder-box"></div>
  {{else}}
    <PixMultiSelect
      @placeholder={{t "common.filters.divisions.placeholder"}}
      @emptyMessage={{t "common.filters.divisions.empty"}}
      @screenReaderOnly={{true}}
      @values={{@selected}}
      @onChange={{@onSelect}}
      @options={{(options @model.divisions)}}
      @isSearchable={{true}}
      ...attributes
    >
      <:label>{{t "common.filters.divisions.label"}}</:label>
      <:default as |option|>{{option.label}}</:default>
    </PixMultiSelect>
  {{/if}}
</template>
