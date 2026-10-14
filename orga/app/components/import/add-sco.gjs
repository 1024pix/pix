import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import UploadButton from '../upload-button';
import ImportCard from './import-card';

export default class ScoOrganizationParticipantAdd extends Component {
  @service currentUser;

  get textsByOrganizationType() {
    if (this.currentUser.isSCOManagingStudents || this.currentUser.canAccessMissionsPage) {
      return {
        title: 'pages.organization-participants-import.actions.sco.title',
        details: 'pages.organization-participants-import.actions.sco.details',
        detailsAdd: 'pages.organization-participants-import.actions.sco.details-add',
        detailsUpdate: 'pages.organization-participants-import.actions.sco.details-update',
        detailsDisable: 'pages.organization-participants-import.actions.sco.details-disable',
      };
    } else if (this.currentUser.hasLearnerImportFeature) {
      return {
        title: 'pages.organization-participants-import.actions.participants.title',
        details: 'pages.organization-participants-import.actions.participants.details',
        detailsAdd: 'pages.organization-participants-import.actions.participants.details-add',
        detailsUpdate: 'pages.organization-participants-import.actions.participants.details-update',
        detailsDisable: 'pages.organization-participants-import.actions.participants.details-disable',
      };
    } else {
      return {};
    }
  }

  <template>
    <ImportCard @cardTitle={{t this.textsByOrganizationType.title}}>
      <:cardDetails>
        <p class="import-card__sub-title">
          {{t this.textsByOrganizationType.details}}
        </p>

        <ul class="import-card__list">
          <li>{{t this.textsByOrganizationType.detailsAdd}}</li>
          <li>{{t this.textsByOrganizationType.detailsUpdate}}</li>
          <li>{{t this.textsByOrganizationType.detailsDisable}}</li>
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
}
