import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import formatDate from 'ember-intl/helpers/format-date';

export default class UserCertificationCourses extends Component {
  @service intl;
  @service accessControl;

  <template>
    <header class="header page-section__header">
      <h2 class="page-section__title">
        {{t "components.users.certification-centers.certification-courses.section-title"}}
      </h2>
    </header>

    {{#if @certificationCourses.length}}
      <PixTable
        @variant="admin"
        @data={{@certificationCourses}}
        @caption={{t "components.users.certification-centers.certification-courses.table-caption"}}
      >
        <:columns as |certificationCourse context|>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "components.users.certification-centers.certification-courses.table-headers.id"}}
            </:header>
            <:cell>
              {{#if this.accessControl.hasAccessToCertificationDetailLinks}}
                <LinkTo @route="authenticated.sessions.certification.informations" @model={{certificationCourse.id}}>
                  {{certificationCourse.id}}
                </LinkTo>
              {{else}}
                {{certificationCourse.id}}
              {{/if}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "components.users.certification-centers.certification-courses.table-headers.created-at"}}
            </:header>
            <:cell>
              {{formatDate certificationCourse.createdAt}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "components.users.certification-centers.certification-courses.table-headers.session-id"}}
            </:header>
            <:cell>
              <LinkTo @route="authenticated.sessions.session.informations" @model={{certificationCourse.sessionId}}>
                {{certificationCourse.sessionId}}
              </LinkTo>
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "components.users.certification-centers.certification-courses.table-headers.session-status"}}
            </:header>
            <:cell>
              {{#if certificationCourse.isPublished}}
                {{t "pages.certifications.session-state.published"}}
              {{else}}
                {{t "pages.certifications.session-state.not-published"}}
              {{/if}}
            </:cell>
          </PixTableColumn>
        </:columns>
      </PixTable>
    {{else}}
      <div class="table__empty">{{t "components.users.certification-centers.certification-courses.empty-table"}}</div>
    {{/if}}
  </template>
}
