import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
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
        Êtes-vous sûr de vouloir archiver cette organisation ?
      </p>
      <ul class="archiving-confirmation-modal__list">
        <li class="archiving-confirmation-modal__information">Les membres actifs vont être désactivés</li>
        <li class="archiving-confirmation-modal__information">Les invitations en attente vont être annulées</li>
        <li class="archiving-confirmation-modal__information">Les campagnes actives vont être archivées</li>
        <li class="archiving-confirmation-modal__information">
          Le rattachement et l'invitation de nouvelles personnes seront bloqués
        </li>
      </ul>
      <p>
        <strong>
          Cette action est irréversible.
        </strong>
      </p>
    </:content>

    <:footer>
      <PixButton @size="small" @variant="secondary" @triggerAction={{@toggleArchivingConfirmationModal}}>
        {{t "common.actions.cancel"}}
      </PixButton>
      <PixButton @type="submit" @size="small" {{on "click" @archiveOrganization}}>
        Confirmer
      </PixButton>
    </:footer>
  </PixModal>
</template>
