import { t } from 'ember-intl';

import ImportCard from '../import-card';
import UploadButton from '../upload-button';

<template>
  <ImportCard @cardTitle={{t "pages.organization-participants-import.actions.add-sco.title"}}>
    <:cardDetails>
      <p class="import-card__sub-title">
        {{t "pages.organization-participants-import.actions.add-sco.details"}}
      </p>

      <ul class="import-card__list">
        <li>{{t "pages.organization-participants-import.actions.add-sco.details-add-student"}}</li>
        <li>{{t "pages.organization-participants-import.actions.add-sco.details-update-student"}}</li>
        <li>{{t "pages.organization-participants-import.actions.add-sco.details-disable-student"}}</li>
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
        {{t "pages.organization-participants-import.actions.add-sco.label"}}
      </UploadButton>
    </:cardFooter>
  </ImportCard>
</template>
