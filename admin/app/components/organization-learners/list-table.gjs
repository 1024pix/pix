import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import formatDate from 'ember-intl/helpers/format-date';
import t from 'ember-intl/helpers/t';

export default class AdminLearnerList extends Component {
  @service router;

  @tracked organizationSort = this.router.currentRoute?.queryParams.organizationSort;
  @tracked birthdateSort = this.router.currentRoute?.queryParams.birthdateSort;
  @tracked updatedAtSort = this.router.currentRoute?.queryParams.updatedAtSort;

  @action
  sortByOrganizationName() {
    this.updateSort({ organizationSort: this.organizationSort === 'asc' ? 'desc' : 'asc' });
  }

  @action
  sortByBirthdate() {
    this.updateSort({ birthdateSort: this.birthdateSort === 'asc' ? 'desc' : 'asc' });
  }

  @action
  sortByUpdatedAt() {
    this.updateSort({ updatedAtSort: this.updatedAtSort === 'asc' ? 'desc' : 'asc' });
  }

  updateSort({ organizationSort, birthdateSort, updatedAtSort }) {
    this.organizationSort = organizationSort;
    this.birthdateSort = birthdateSort;
    this.updatedAtSort = updatedAtSort;
    this.router.transitionTo({
      queryParams: {
        organizationSort: this.organizationSort ?? undefined,
        birthdateSort: this.birthdateSort ?? undefined,
        updatedAtSort: this.updatedAtSort ?? undefined,
        pageNumber: undefined,
      },
    });
  }

  <template>
    {{#if @organizationLearners}}
      <PixTable
        @variant="admin"
        @caption={{t "components.organization-learners.list-table.caption"}}
        @data={{@organizationLearners}}
        class="table organization-learner-list"
      >
        <:columns as |organizationLearner context|>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "components.organization-learners.list-table.headers.first-name"}}
            </:header>
            <:cell>
              {{organizationLearner.firstName}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "components.organization-learners.list-table.headers.last-name"}}
            </:header>
            <:cell>
              {{organizationLearner.lastName}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn
            @onSort={{this.sortByOrganizationName}}
            @sortOrder={{this.organizationSort}}
            @context={{context}}
            @ariaLabelDefaultSort="Trier par orga"
            @ariaLabelSortAsc="Trier par orga asc"
            @ariaLabelSortDesc="Trier par orga desc"
          >
            <:header>
              {{t "components.organization-learners.list-table.headers.organization"}}
            </:header>
            <:cell>
              {{#if organizationLearner.organizationId}}
                <LinkTo
                  @route="authenticated.organizations.get"
                  @model={{organizationLearner.organizationId}}
                  aria-label={{t "components.organization-learners.list-table.view-organization"}}
                >
                  {{organizationLearner.organizationName}}
                </LinkTo>
              {{else}}
                {{organizationLearner.organizationName}}
              {{/if}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn
            @type="number"
            @onSort={{this.sortByBirthdate}}
            @sortOrder={{this.birthdateSort}}
            @context={{context}}
            @ariaLabelDefaultSort="Trier par birthdate"
            @ariaLabelSortAsc="Trier par birthdate asc"
            @ariaLabelSortDesc="Trier par birthdate desc"
          >
            <:header>
              {{t "components.organization-learners.list-table.headers.birthdate"}}
            </:header>
            <:cell>
              {{formatDate organizationLearner.birthdate}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "components.organization-learners.list-table.headers.national-student-id"}}
            </:header>
            <:cell>
              {{organizationLearner.nationalStudentId}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "components.organization-learners.list-table.headers.division-group"}}
            </:header>
            <:cell>
              {{#if organizationLearner.division}}
                {{organizationLearner.division}}
              {{else if organizationLearner.group}}
                {{organizationLearner.group}}
              {{/if}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "components.organization-learners.list-table.headers.user-id"}}
            </:header>
            <:cell>
              {{#if organizationLearner.userId}}
                <LinkTo
                  @route="authenticated.users.get"
                  @model={{organizationLearner.userId}}
                  aria-label={{t "components.organization-learners.list-table.view-user"}}
                >
                  {{organizationLearner.userId}}
                </LinkTo>
              {{/if}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "components.organization-learners.list-table.headers.active"}}
            </:header>
            <:cell>
              {{#if organizationLearner.isDisabled}}
                <span class="organization-learner-list__icon-disabled">
                  <PixIcon
                    @name="cancel"
                    @plainIcon={{true}}
                    @title={{t "components.organization-learners.list-table.headers.inactive"}}
                  />
                </span>
              {{else}}
                <span class="organization-learner-list__icon-active">
                  <PixIcon
                    @name="checkCircle"
                    @plainIcon={{true}}
                    @title={{t "components.organization-learners.list-table.headers.active"}}
                  />
                </span>
              {{/if}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn
            @type="number"
            @onSort={{this.sortByUpdatedAt}}
            @sortOrder={{this.updatedAtSort}}
            @context={{context}}
            @ariaLabelDefaultSort="Trier par date maj"
            @ariaLabelSortAsc="Trier par date maj asc"
            @ariaLabelSortDesc="Trier par date maj desc"
          >
            <:header>
              {{t "components.organization-learners.list-table.headers.updated-at"}}
            </:header>
            <:cell>
              {{formatDate organizationLearner.updatedAt}}
            </:cell>
          </PixTableColumn>
        </:columns>
      </PixTable>

      <PixPagination @pagination={{@organizationLearners.meta}} />
    {{else}}
      <div class="table__empty">{{t "common.tables.empty-result"}}</div>
    {{/if}}
  </template>
}
