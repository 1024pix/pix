import { t } from 'ember-intl';

import ImportCard from '../../import-card';
import UploadButton from '../../upload-button';

<template>
  <ImportCard @cardTitle={{t "pages.organization-participants-import.actions.add-sup.title"}}>
    <:cardDetails>
      {{t "pages.organization-participants-import.actions.add-sup.details"}}
    </:cardDetails>
    <:cardFooter>
      <UploadButton
        @id="students-file-upload"
        @size="small"
        @disabled={{@disabled}}
        @onChange={{@importHandler}}
        @supportedFormats={{@supportedFormats}}
      >
        {{t "pages.organization-participants-import.actions.add-sup.label"}}
      </UploadButton>
    </:cardFooter>
  </ImportCard>
</template>
