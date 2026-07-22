import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import AttachedCertificationCenterForm from 'pix-admin/components/organizations/attached-certification-centers/attach-certification-center-form';
import { organizationRequestsBuilder } from 'pix-admin/requests-builders/organization-requests-builder';

export default class AttachedCertificationCenter extends Component {
  @service intl;
  @service pixToast;
  @service requestManager;
  @service router;

  @tracked showDetachModal = false;

  get attachedCertificationCenter() {
    return this.args.attachedCertificationCenters[0];
  }

  @action
  openDetachModal() {
    this.showDetachModal = true;
  }

  @action
  closeDetachModal() {
    this.showDetachModal = false;
  }

  @action
  async handleAttachCertificationCenter(certificationCenterId) {
    const attachCertificationCenterRequest = organizationRequestsBuilder.buildAttachCertificationCenterRequest({
      organizationId: this.args.organizationId,
      certificationCenterId,
    });

    try {
      await this.requestManager.request(attachCertificationCenterRequest);
      this.pixToast.sendSuccessNotification({
        message: this.intl.t('components.organizations.attached-certification-center.notifications.attach-success'),
      });
      this.router.refresh(this.router.currentRouteName);
    } catch (responseError) {
      const error = responseError?.errors?.[0];
      let message;

      switch (error?.code) {
        case 'NON_EXISTING_CERTIFICATION_CENTER':
          message = this.intl.t(
            'components.organizations.attached-certification-center.notifications.errors.NON_EXISTING_CERTIFICATION_CENTER',
            { certificationCenterId: error.meta.certificationCenterId },
          );
          break;
        case 'ALREADY_ATTACHED_CERTIFICATION_CENTER':
          message = this.intl.t(
            'components.organizations.attached-certification-center.notifications.errors.ALREADY_ATTACHED_CERTIFICATION_CENTER',
            {
              certificationCenterId: error.meta.certificationCenterId,
              alreadyAttachedOrganizationId: error.meta.alreadyAttachedOrganizationId,
            },
          );
          break;
        default:
          message = this.intl.t('common.notifications.generic-error');
      }

      this.pixToast.sendErrorNotification({ message });
    }
  }

  @action
  async detachCertificationCenter() {
    const detachCertificationCenterRequest = organizationRequestsBuilder.buildDetachCertificationCenterRequest({
      organizationId: this.args.organizationId,
    });
    try {
      await this.requestManager.request(detachCertificationCenterRequest);
      await this.pixToast.sendSuccessNotification({
        message: this.intl.t('components.organizations.attached-certification-center.actions.detach.success'),
      });
      this.router.refresh(this.router.currentRouteName);
    } catch {
      await this.pixToast.sendErrorNotification({
        message: this.intl.t('common.notifications.generic-error'),
      });
    } finally {
      this.closeDetachModal();
    }
  }

  <template>
    {{#if this.attachedCertificationCenter}}
      <PixTable
        @variant="admin"
        @caption={{t "components.organizations.attached-certification-center.table.caption"}}
        @data={{@attachedCertificationCenters}}
      >
        <:columns as |certificationCenter context|>
          <PixTableColumn @context={{context}}>
            <:header>{{t "components.organizations.attached-certification-center.table.headers.id"}}</:header>
            <:cell>
              <LinkTo @route="authenticated.certification-centers.get" @model={{certificationCenter.id}}>
                {{certificationCenter.id}}
              </LinkTo>
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>{{t "components.organizations.attached-certification-center.table.headers.name"}}</:header>
            <:cell>{{certificationCenter.name}}</:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>{{t "components.organizations.attached-certification-center.table.headers.external-id"}}</:header>
            <:cell>{{certificationCenter.externalId}}</:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>{{t "components.organizations.attached-certification-center.table.headers.actions"}}</:header>
            <:cell>
              <PixButton @variant="error" @size="small" @triggerAction={{this.openDetachModal}}>
                {{t "components.organizations.attached-certification-center.actions.detach.button"}}
              </PixButton>
            </:cell>
          </PixTableColumn>
        </:columns>
      </PixTable>
    {{else}}
      <AttachedCertificationCenterForm @onFormSubmitted={{this.handleAttachCertificationCenter}} />

    {{/if}}

    <PixModal
      @title={{t "components.organizations.attached-certification-center.actions.detach.confirm-modal-title"}}
      @iconName="warning"
      @onCloseButtonClick={{this.closeDetachModal}}
      @showModal={{this.showDetachModal}}
    >
      <:content>
        <p>
          {{t
            "components.organizations.attached-certification-center.actions.detach.confirm-modal-message"
            certificationCenterName=this.attachedCertificationCenter.name
            htmlSafe=true
          }}
        </p>
      </:content>
      <:footer>
        <PixButton @variant="secondary" @triggerAction={{this.closeDetachModal}}>
          {{t "common.actions.cancel"}}
        </PixButton>
        <PixButton @variant="error" @triggerAction={{this.detachCertificationCenter}}>
          {{t "common.actions.confirm"}}
        </PixButton>
      </:footer>
    </PixModal>
  </template>
}
