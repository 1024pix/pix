import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import ENV from 'pix-orga/config/environment';

export default class DownloadImportTemplateLink extends Component {
  @service currentUser;
  @service intl;
  @service session;

  get urlToDownloadCsvTemplate() {
    return `${ENV.APP.API_HOST}/api/organizations/${this.currentUser.organization.id}/organization-learners/csv-template?accessToken=${this.session.data.authenticated.access_token}&lang=${this.intl.primaryLocale}`;
  }

  get showLink() {
    return this.currentUser.hasLearnerImportFeature || this.currentUser.isSUPManagingStudents;
  }

  <template>
    {{#if this.showLink}}
      <PixButtonLink
        @href={{this.urlToDownloadCsvTemplate}}
        @variant="secondary"
        target="_blank"
        rel="noopener noreferrer"
        download
      >
        {{t "pages.sup-organization-participants.actions.download-template"}}
      </PixButtonLink>
    {{/if}}
  </template>
}
