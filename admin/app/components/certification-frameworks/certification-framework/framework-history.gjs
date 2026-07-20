import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { concat, fn, get } from '@ember/helper';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import formatDate from 'ember-intl/helpers/format-date';
import { eq, not } from 'ember-truth-helpers';
import { formatMinutes } from 'pix-admin/utils/date';

import CertificationVersionDetailModal from './modal/certification-version-detail-modal';

const STATUS_COLORS = { active: 'success', draft: 'tertiary', archived: 'secondary' };

export default class FrameworkHistory extends Component {
  @service store;
  @service intl;
  @service pixToast;
  @service router;

  @tracked selectedVersion = null;
  @tracked selectedVersionStatus = null;
  @tracked showDeletionConfirmationModal = false;
  @tracked showVersionDetailModal = false;

  get frameworkHistory() {
    return sortByStatus(this.args.certificationVersionSummaries);
  }

  get hasHistory() {
    return this.frameworkHistory.length > 0;
  }

  @action
  async viewVersion(id, status) {
    this.selectedVersionStatus = status;
    this.selectedVersion = await this.store.findRecord('certification-version', id);
    this.showVersionDetailModal = true;
  }

  @action
  closeModalVersionDetail() {
    this.selectedVersion = null;
    this.selectedVersionStatus = null;
    this.showVersionDetailModal = false;
  }

  @action
  async showDeleteVersionModal(selectedVersionId) {
    this.selectedVersion = await this.store.findRecord('certification-version', selectedVersionId);
    this.showDeletionConfirmationModal = true;
  }

  @action
  closeDeleteVersionModal() {
    this.showDeletionConfirmationModal = false;
  }

  @action
  async deleteVersion() {
    try {
      await this.selectedVersion.destroyRecord();
      await this.store.findRecord('certification-framework', this.args.frameworkKey);
      this.pixToast.sendSuccessNotification({
        message: this.intl.t('components.certification-frameworks.deletion-modal.success-message'),
      });
    } catch {
      this.pixToast.sendErrorNotification({
        message: this.intl.t('components.certification-frameworks.deletion-modal.error-message'),
      });
    } finally {
      this.closeDeleteVersionModal();
    }
  }

  @action
  editVersion(versionId) {
    this.router.transitionTo(
      'authenticated.certification-frameworks.certification-framework.versions.version.edit',
      versionId,
    );
  }

  <template>
    <section class="framework-versions">
      <PixTable
        @variant="admin"
        @caption={{t "components.certification-frameworks.certification-framework.history.table.caption"}}
        @data={{this.frameworkHistory}}
      >
        <:columns as |version context|>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "components.certification-frameworks.certification-framework.history.table.columns.version-id"}}
            </:header>
            <:cell>
              {{version.id}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t
                "components.certification-frameworks.certification-framework.history.table.columns.maximum-assessment-length"
              }}
            </:header>
            <:cell>
              {{version.maximumAssessmentLength}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              <PixIcon @name="time" @ariaHidden={{true}} />
              {{t
                "components.certification-frameworks.certification-framework.history.table.columns.assessment-duration"
              }}
            </:header>
            <:cell>
              {{formatMinutes version.assessmentDuration}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              <PixIcon @name="calendar" @ariaHidden={{true}} />
              {{t "components.certification-frameworks.certification-framework.history.table.columns.start-date"}}
            </:header>
            <:cell>
              <strong>{{if version.startDate (formatDate version.startDate) "-"}}</strong>
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              <PixIcon @name="calendar" @ariaHidden={{true}} />
              {{t "components.certification-frameworks.certification-framework.history.table.columns.expiration-date"}}
            </:header>
            <:cell>
              <strong>{{if version.expirationDate (formatDate version.expirationDate) "-"}}</strong>
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "components.certification-frameworks.certification-framework.history.table.columns.status"}}
            </:header>
            <:cell>
              <PixTag @color={{get STATUS_COLORS version.status}}>
                {{t
                  (concat
                    "components.certification-frameworks.certification-framework.history.statuses." version.status
                  )
                }}
              </PixTag>
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "components.certification-frameworks.certification-framework.history.table.columns.actions"}}
            </:header>
            <:cell>
              <PixIconButton
                @triggerAction={{fn this.viewVersion version.id version.status}}
                @ariaLabel={{t
                  "components.certification-frameworks.certification-framework.history.table.actions.view"
                  id=version.id
                }}
                @iconName="eye"
              />
              <PixIconButton
                @triggerAction={{fn this.editVersion version.id}}
                @ariaLabel={{t
                  "components.certification-frameworks.certification-framework.history.table.actions.edit"
                  id=version.id
                }}
                @iconName="edit"
                @isDisabled={{not (eq version.status "draft")}}
              />
              <PixIconButton
                @triggerAction={{fn this.showDeleteVersionModal version.id}}
                @ariaLabel={{t
                  "components.certification-frameworks.certification-framework.history.table.actions.delete"
                  id=version.id
                }}
                @iconName="delete"
                @isDisabled={{not (eq version.status "draft")}}
              />
            </:cell>
          </PixTableColumn>
        </:columns>
      </PixTable>

      {{#unless this.hasHistory}}
        <p>{{t "components.certification-frameworks.certification-framework.history.table.empty"}}</p>
      {{/unless}}
    </section>

    {{#if this.selectedVersion}}
      <CertificationVersionDetailModal
        @version={{this.selectedVersion}}
        @status={{this.selectedVersionStatus}}
        @frameworkKey={{@frameworkKey}}
        @onClose={{this.closeModalVersionDetail}}
        @showModal={{this.showVersionDetailModal}}
      />
    {{/if}}

    <PixModal
      @title={{t "components.certification-frameworks.deletion-modal.title"}}
      @onCloseButtonClick={{this.closeDeleteVersionModal}}
      @showModal={{this.showDeletionConfirmationModal}}
    >
      <:content>
        <p>
          {{t "components.certification-frameworks.deletion-modal.content"}}
        </p>
      </:content>
      <:footer>
        <PixButton @triggerAction={{this.deleteVersion}}>
          {{t "components.certification-frameworks.deletion-modal.action-button"}}
        </PixButton>
      </:footer>
    </PixModal>
  </template>
}

function sortByStatus(versionSummaries) {
  const draft = versionSummaries.find((versionSummary) => versionSummary.isDraft);
  const active = versionSummaries.find((versionSummary) => versionSummary.isActive);
  const archivedOnes = versionSummaries.filter((versionSummary) => versionSummary.isArchived);

  archivedOnes.sort((versionSummaryA, versionSummaryB) => {
    const startDateA = new Date(versionSummaryA.startDate);
    const startDateB = new Date(versionSummaryB.startDate);
    if (startDateA > startDateB) return -1;
    if (startDateA < startDateB) return 1;
  });

  const frameworkHistoryList = [draft, active, ...archivedOnes];
  return frameworkHistoryList.filter((versionSummary) => !!versionSummary);
}
