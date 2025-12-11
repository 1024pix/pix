import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { t } from 'ember-intl';
import formatDate from 'ember-intl/helpers/format-date';

import RequirementTag from '../common/combined-courses/requirement-tag';
import AddOrganization from './add-organization';

const selectOrganizationHandler = (organizations) => {
  console.log('on select orgnization', organizations);
};

<template>
  {{#if @summaries}}
    <PixTable
      @variant="admin"
      @data={{@summaries}}
      @caption={{t "components.combined-course-blueprints.list.table.caption"}}
      class="table"
    >
      <:columns as |blueprint context|>
        <PixTableColumn @context={{context}} class="combinedCourseBlueprint__column--compact">
          <:header>
            {{t "common.fields.id"}}
          </:header>
          <:cell>
            {{blueprint.id}}
          </:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}}>
          <:header>
            {{t "common.fields.internalName"}}
          </:header>
          <:cell>
            {{blueprint.internalName}}
            <details>
              <summary>{{t "components.combined-course-blueprints.list.content"}}</summary>
              {{#each blueprint.content as |requirement|}}
                <RequirementTag @type={{requirement.type}} @value={{requirement.value}} />
              {{/each}}
            </details>
          </:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}} class="combinedCourseBlueprint__column--compact">
          <:header>
            {{t "common.fields.createdAt"}}
          </:header>
          <:cell>
            {{formatDate blueprint.createdAt}}
          </:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}} class="combinedCourseBlueprint__column--compact">
          <:header>
            {{t "common.fields.actions"}}
          </:header>
          <:cell>
            <AddOrganization onSelectOrganization={{selectOrganizationHandler}} />
          </:cell>
        </PixTableColumn>
      </:columns>
    </PixTable>
  {{else}}
    <div class="table__empty">{{t "common.tables.empty-result"}}</div>
  {{/if}}
</template>
