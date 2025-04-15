import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import Import from 'pix-orga/components/import/index';
<template>
  {{pageTitle (t "pages.organization-participants-import.title")}}

  <PixButtonLink
    @route={{@controller.participantListRoute}}
    @variant="tertiary"
    @iconBefore="arrowLeft"
    class="import-students-page__previous-page-button"
  >
    {{t "common.actions.back"}}
  </PixButtonLink>

  <Import
    @onImportScoStudents={{@controller.importScoStudents}}
    @onImportSupStudents={{@controller.importSupStudents}}
    @onReplaceStudents={{@controller.replaceStudents}}
    @onImportLearners={{@controller.importOrganizationLearners}}
    @isLoading={{@controller.isLoading}}
    @organizationImportDetail={{@model}}
  />
</template>
