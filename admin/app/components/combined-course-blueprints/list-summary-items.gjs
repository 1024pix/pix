import { PixTable, PixTableColumn } from '@1024pix/nebulix-ember';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import formatDate from 'ember-intl/helpers/format-date';
import DownloadCombinedCourseBlueprint from 'pix-admin/components/combined-course-blueprints/download-combined-course-blueprint';

export default class CombineCourseBluePrintList extends Component {
  @service pixToast;
  @service intl;
  @service currentUser;

  <template>
    {{#if @summaries}}
      <PixTable
        @variant="admin"
        @data={{@summaries}}
        @caption={{t "components.combined-course-blueprints.list.table.caption"}}
        class="table"
      >
        <:columns as |blueprint context|>
          <PixTableColumn @context={{context}} class="combined-course-blueprints__column--compact">
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
              <LinkTo
                @route="authenticated.combined-course-blueprints.combined-course-blueprint"
                @model={{blueprint.id}}
              >{{blueprint.internalName}}</LinkTo>

            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="combined-course-blueprints__column--compact">
            <:header>
              {{t "common.fields.createdAt"}}
            </:header>
            <:cell>
              {{formatDate blueprint.createdAt}}
            </:cell>
          </PixTableColumn>

          <PixTableColumn @context={{context}} class="combined-course-blueprints__column--compact">
            <:header>
              {{t "common.fields.actions"}}
            </:header>
            <:cell>
              <DownloadCombinedCourseBlueprint
                @blueprint={{blueprint}}
                @creatorId={{this.currentUser.adminMember.userId}}
              />
            </:cell>
          </PixTableColumn>
        </:columns>
      </PixTable>
    {{else}}
      <div class="table__empty">{{t "common.tables.empty-result"}}</div>
    {{/if}}
  </template>
}
