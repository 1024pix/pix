import { PixButton, PixCheckbox, PixIcon, PixTable, PixTableColumn } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import formatDate from 'ember-intl/helpers/format-date';
import t from 'ember-intl/helpers/t';
import { not } from 'ember-truth-helpers';
import FilterBanner from 'pix-admin/components/organization-learners/filter-banner';
import ActionBar from 'pix-admin/components/ui/action-bar';
import DeletionModal from 'pix-admin/components/ui/deletion-modal';
import PaginationWrapper from 'pix-admin/components/ui/pagination-wrapper';

export const learnerDetailsMetabaseLink = (learnerId) => {
  return `https://metabase.pix.fr/dashboard/1718?id=${learnerId}`;
};

export default class AdminLearnerList extends Component {
  @service router;
  @service store;
  @service pixToast;
  @service intl;

  @tracked selectedLearners = [];
  @tracked showDeletionModal = false;

  @tracked sort = {
    organizationSort: this.router.currentRoute?.queryParams.organizationSort,
    birthdateSort: this.router.currentRoute?.queryParams.birthdateSort,
    updatedAtSort: this.router.currentRoute?.queryParams.updatedAtSort,
  };

  @action
  sortBy(key) {
    const keyToSort = {
      [key]: this.sort[key] === 'asc' ? 'desc' : 'asc',
    };
    this.sort = { organizationSort: undefined, birthdateSort: undefined, updatedAtSort: undefined, ...keyToSort };
    this.resetSelectedLearners();
    this.router.transitionTo({
      queryParams: {
        ...this.sort,
        pageNumber: undefined,
      },
    });
  }

  get areAllLearnersSelected() {
    return this.selectedLearners.length === this.args.organizationLearners.length;
  }

  get areSomeLearnersSelected() {
    return this.selectedLearners.length >= 1;
  }

  @action
  isLearnerSelected(learner) {
    return this.selectedLearners.includes(learner);
  }

  @action
  toggleLearner(learner) {
    if (this.isLearnerSelected(learner)) {
      this.selectedLearners = this.selectedLearners.filter((selectedLearner) => selectedLearner !== learner);
    } else {
      this.selectedLearners = [...this.selectedLearners, learner];
    }
  }

  @action
  toggleAllLearners() {
    if (this.areSomeLearnersSelected) {
      this.resetSelectedLearners();
    } else {
      this.selectedLearners = this.args.organizationLearners.slice();
    }
  }

  @action
  resetSelectedLearners() {
    this.selectedLearners = [];
  }

  @action
  openDeletionModal() {
    this.showDeletionModal = true;
  }

  @action
  closeDeletionModal() {
    this.showDeletionModal = false;
  }

  @action
  async deleteLearners() {
    try {
      const adapter = this.store.adapterFor('organization-learner');
      await adapter.deleteOrganizationLearners(this.selectedLearners.map(({ id }) => id));
      this.pixToast.sendSuccessNotification({
        message: this.intl.t('components.organization-learners.list-table.deletion-modal.success-message', {
          count: this.selectedLearners.length,
        }),
      });
      this.resetSelectedLearners();
      this.router.refresh();
    } catch {
      const errorMessage = this.intl.t('common.api-error-messages.internal-server-error');
      this.pixToast.sendErrorNotification({ message: errorMessage });
    } finally {
      this.closeDeletionModal();
    }
  }

  <template>
    <FilterBanner @onFiltersChange={{this.resetSelectedLearners}} />

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
              <PixCheckbox
                @screenReaderOnly={{true}}
                @checked={{this.areSomeLearnersSelected}}
                @isIndeterminate={{not this.areAllLearnersSelected}}
                disabled={{not @organizationLearners.length}}
                {{on "click" this.toggleAllLearners}}
              >
                <:label>{{t "components.organization-learners.list-table.headers.select-all"}}</:label>
              </PixCheckbox>
            </:header>
            <:cell>
              <PixCheckbox
                @screenReaderOnly={{true}}
                @checked={{this.isLearnerSelected organizationLearner}}
                {{on "click" (fn this.toggleLearner organizationLearner)}}
              >
                <:label>
                  {{t
                    "components.organization-learners.list-table.select-learner"
                    firstname=organizationLearner.firstName
                    lastname=organizationLearner.lastName
                  }}
                </:label>
              </PixCheckbox>
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "common.fields.id"}}
            </:header>
            <:cell>
              <a href={{learnerDetailsMetabaseLink organizationLearner.id}} target="_blank" rel="noreferrer noopener">
                <span
                  aria-label={{t
                    "components.organization-learners.list-table.view-learner"
                    learner=organizationLearner.fullName
                  }}
                >
                  {{organizationLearner.id}}
                </span>
              </a>
            </:cell>
          </PixTableColumn>
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
            @onSort={{fn this.sortBy "organizationSort"}}
            @sortOrder={{this.sort.organizationSort}}
            @context={{context}}
            @ariaLabelDefaultSort={{t "components.organization-learners.list-table.sort.organization.default"}}
            @ariaLabelSortAsc={{t "components.organization-learners.list-table.sort.organization.asc"}}
            @ariaLabelSortDesc={{t "components.organization-learners.list-table.sort.organization.desc"}}
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
            @onSort={{fn this.sortBy "birthdateSort"}}
            @sortOrder={{this.sort.birthdateSort}}
            @context={{context}}
            @ariaLabelDefaultSort={{t "components.organization-learners.list-table.sort.birthdate.default"}}
            @ariaLabelSortAsc={{t "components.organization-learners.list-table.sort.birthdate.asc"}}
            @ariaLabelSortDesc={{t "components.organization-learners.list-table.sort.birthdate.desc"}}
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
            @onSort={{fn this.sortBy "updatedAtSort"}}
            @sortOrder={{this.sort.updatedAtSort}}
            @context={{context}}
            @ariaLabelDefaultSort={{t "components.organization-learners.list-table.sort.updated-at.default"}}
            @ariaLabelSortAsc={{t "components.organization-learners.list-table.sort.updated-at.asc"}}
            @ariaLabelSortDesc={{t "components.organization-learners.list-table.sort.updated-at.desc"}}
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

      <PaginationWrapper @pagination={{@organizationLearners.meta}} @onChange={{this.resetSelectedLearners}} />

      {{#if this.areSomeLearnersSelected}}
        <ActionBar>
          <:information>
            {{t
              "components.organization-learners.list-table.action-bar.information"
              count=this.selectedLearners.length
            }}
          </:information>
          <:actions>
            <PixButton @triggerAction={{this.openDeletionModal}} type="button" @variant="error">
              {{t "components.organization-learners.list-table.action-bar.delete-button"}}
            </PixButton>
          </:actions>
        </ActionBar>
      {{/if}}

    {{else}}
      <div class="table__empty">{{t "common.tables.empty-result"}}</div>
    {{/if}}

    <DeletionModal
      @title={{t "components.organization-learners.list-table.deletion-modal.title"}}
      @onCloseModal={{this.closeDeletionModal}}
      @showModal={{this.showDeletionModal}}
      @onTriggerAction={{this.deleteLearners}}
    >
      <:content>
        <p>
          {{t
            "components.organization-learners.list-table.deletion-modal.warning-message"
            count=this.selectedLearners.length
          }}
        </p>
      </:content>
    </DeletionModal>
  </template>
}
