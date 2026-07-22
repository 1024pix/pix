import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import formatDate from 'ember-intl/helpers/format-date';
import sortBy from 'lodash/sortBy';
import { DescriptionList } from 'pix-admin/components/ui/description-list';
import ENV from 'pix-admin/config/environment';

import HabilitationTag from './habilitation-tag';

export default class InformationView extends Component {
  @service intl;
  @tracked habilitations = [];
  @tracked isArchiveModalOpen = false;
  @service store;

  constructor() {
    super(...arguments);
    Promise.resolve(this.args.certificationCenter.habilitations).then((habilitations) => {
      this.habilitations = habilitations;
    });
  }

  get availableHabilitations() {
    const habilitations = sortBy(this.args.availableHabilitations, 'id');
    return habilitations.map((habilitation) => {
      const isHabilitated = this.habilitations.includes(habilitation);
      const label = habilitation.label;
      const ariaLabel = this.intl.t(
        `pages.certification-centers.information-view.habilitations.aria-label.${
          isHabilitated ? 'active' : 'inactive'
        }`,
        { complementaryCertificationLabel: label },
      );
      return { isHabilitated, label, ariaLabel };
    });
  }

  get externalURL() {
    const urlDashboardPrefix = ENV.APP.CERTIFICATION_CENTER_DASHBOARD_URL;
    return urlDashboardPrefix && urlDashboardPrefix + this.args.certificationCenter.id;
  }

  @action
  toggleShowArchiveModal() {
    this.isArchiveModalOpen = !this.isArchiveModalOpen;
  }

  @action
  async archiveCertificationCenter() {
    const adapter = this.store.adapterFor('certification-center');
    await adapter.archiveCertificationCenter(this.args.certificationCenter.id);

    this.toggleShowArchiveModal();
    await this.args.certificationCenter.reload();

    return this.args.refreshModel();
  }

  <template>
    <h1 class="certification-center-information-display__name">{{@certificationCenter.name}}</h1>

    {{#if @certificationCenter.isArchived}}
      <PixNotificationAlert class="certification-center-information-display__archived-warning" @type="warning">
        {{t
          "pages.certification-centers.information-view.is-archived-warning"
          archivedAt=@certificationCenter.archivedAtFormatDate
          archivedBy=@certificationCenter.archivistFullName
        }}
      </PixNotificationAlert>
    {{/if}}

    <DescriptionList>

      <DescriptionList.Item @label={{t "pages.certification-centers.information-view.list.type"}}>
        {{@certificationCenter.typeLabel}}
      </DescriptionList.Item>

      <DescriptionList.Item @label={{t "pages.certification-centers.information-view.list.external-id"}}>
        {{@certificationCenter.externalId}}
      </DescriptionList.Item>

      <DescriptionList.ItemWithHTMLElement>
        <:label>
          {{t "pages.certification-centers.information-view.list.dpo-name"}}
          <abbr title={{t "pages.certification-centers.information-view.list.dpo-definition"}}>{{t
              "pages.certification-centers.information-view.list.dpo"
            }}</abbr>
        </:label>
        <:value>
          {{@certificationCenter.dataProtectionOfficerFullName}}
        </:value>
      </DescriptionList.ItemWithHTMLElement>
      <DescriptionList.ItemWithHTMLElement>
        <:label>
          {{t "pages.certification-centers.information-view.list.dpo-email"}}
          <abbr title={{t "pages.certification-centers.information-view.list.dpo-definition"}}>{{t
              "pages.certification-centers.information-view.list.dpo"
            }}</abbr>
        </:label>
        <:value>
          {{@certificationCenter.dataProtectionOfficerEmail}}
        </:value>
      </DescriptionList.ItemWithHTMLElement>

      <DescriptionList.ItemWithHTMLElement>
        <:label>
          {{t "pages.certification-centers.information-view.list.createdAt"}}
        </:label>
        <:value>
          {{formatDate @certificationCenter.createdAt}}
        </:value>
      </DescriptionList.ItemWithHTMLElement>

      <DescriptionList.Item @label={{t "pages.certification-centers.information-view.habilitations.title"}}>
        <ul class="certification-center-information-display__habilitations-list">
          {{#each this.availableHabilitations as |habilitation|}}
            <HabilitationTag
              @label={{habilitation.label}}
              @active={{habilitation.isHabilitated}}
              @arialabel={{habilitation.ariaLabel}}
            />
          {{/each}}
        </ul>
      </DescriptionList.Item>

    </DescriptionList>

    <ul class="certification-center-information-display__action-buttons">
      <li>
        <PixButton @size="small" @triggerAction={{@toggleEditMode}}>
          {{t "common.actions.edit"}}
        </PixButton>
      </li>
      {{#unless @certificationCenter.isArchived}}
        <li>
          <PixButton @variant="error" @size="small" @triggerAction={{this.toggleShowArchiveModal}}>
            {{t "common.actions.archive"}}
          </PixButton>
        </li>
      {{/unless}}
      <li>
        <PixButtonLink
          @variant="secondary"
          @href={{this.externalURL}}
          @size="small"
          target="_blank"
          rel="noopener noreferrer"
        >
          Tableau de bord
        </PixButtonLink>
      </li>
    </ul>

    {{#if this.isArchiveModalOpen}}
      <PixModal
        @title={{t
          "pages.certification-centers.archive-confirmation-modal.title"
          certificationCenterName=@certificationCenter.name
        }}
        @showModal={{this.isArchiveModalOpen}}
        @onCloseButtonClick={{this.toggleShowArchiveModal}}
      >
        <:content>
          <p>{{t "pages.certification-centers.archive-confirmation-modal.question"}}</p>
          <ul class="certification-center-confirmation-modal__list">
            <li>{{t "pages.certification-centers.archive-confirmation-modal.members"}}</li>
            <li>{{t "pages.certification-centers.archive-confirmation-modal.invitations"}}</li>
            <li>{{t "pages.certification-centers.archive-confirmation-modal.attachment"}}</li>
          </ul>
          <p class="certification-center-confirmation-modal__warning">{{t
              "pages.certification-centers.archive-confirmation-modal.warning"
            }}</p>
        </:content>
        <:footer>
          <PixButton @triggerAction={{this.toggleShowArchiveModal}} @size="small" @variant="secondary">
            {{t "common.actions.cancel"}}
          </PixButton>
          <PixButton @triggerAction={{this.archiveCertificationCenter}} @size="small">
            {{t "common.actions.confirm"}}
          </PixButton>
        </:footer>
      </PixModal>
    {{/if}}
  </template>
}
