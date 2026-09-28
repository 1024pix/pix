import { PixButton, PixModal } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { t } from 'ember-intl';

<template>
  <PixModal
    @title="Archiver l'organisation {{@organizationName}}"
    @onCloseButtonClick={{@toggleArchivingConfirmationModal}}
    @showModal={{@displayModal}}
  >
    <:content>
      <p>
        {{t "components.organizations.information-section-view.archive-organization.confirmation"}}
      </p>
      <ul class="archiving-confirmation-modal__list">
        <li class="archiving-confirmation-modal__information">{{t
            "components.organizations.information-section-view.archive-organization.warnings.active-members"
          }}</li>
        <li class="archiving-confirmation-modal__information">{{t
            "components.organizations.information-section-view.archive-organization.warnings.pending-invitations"
          }}</li>
        <li class="archiving-confirmation-modal__information">{{t
            "components.organizations.information-section-view.archive-organization.warnings.active-campaigns"
          }}</li>
        <li class="archiving-confirmation-modal__information">
          {{t "components.organizations.information-section-view.archive-organization.warnings.linking"}}
        </li>
      </ul>
      <p>
        <strong>
          {{t "components.organizations.information-section-view.archive-organization.warnings.undone"}}
        </strong>
      </p>
    </:content>

    <:footer>
      <PixButton @size="small" @variant="secondary" @triggerAction={{@toggleArchivingConfirmationModal}}>
        {{t "common.actions.cancel"}}
      </PixButton>
      <PixButton @type="submit" @size="small" {{on "click" @archiveOrganization}}>
        {{t "common.actions.confirm"}}
      </PixButton>
    </:footer>
  </PixModal>
</template>
