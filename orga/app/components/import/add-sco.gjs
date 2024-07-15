import { t } from 'ember-intl';

import UploadButton from '../upload-button';
import ImportCard from './import-card';

<template>
  <ImportCard @cardTitle={{t "pages.organization-participants-import.actions.participants.title"}}>
    <:cardDetails>
      <p class="import-card__sub-title">
        {{t "pages.organization-participants-import.actions.participants.details"}}
      </p>

      <ul class="import-card__list">
        <li>{{t "pages.organization-participants-import.actions.participants.details-add"}}</li>
        <li>{{t "pages.organization-participants-import.actions.participants.details-update"}}</li>
        <li>{{t "pages.organization-participants-import.actions.participants.details-disable"}}</li>
      </ul>
    </:cardDetails>
    <:cardFooter>
      <UploadButton
        @id="students-file-upload"
        @size="small"
        @disabled={{@disabled}}
        @onChange={{@importHandler}}
        @supportedFormats={{@supportedFormats}}
      >
        {{t "pages.organization-participants-import.actions.participants.label"}}
      </UploadButton>
    </:cardFooter>
  </ImportCard>
</template>
