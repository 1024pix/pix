import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import { DescriptionList } from 'pix-admin/components/ui/description-list';

export default class Cgu extends Component {
  @service accessControl;
  @service intl;

  get userHasValidatePixAppTermsOfService() {
    return this._formatValidatedTermsOfServiceText(
      this.args.pixAppTermsOfServiceAccepted,
      this.args.lastPixAppTermsOfServiceValidatedAt,
    );
  }

  get userHasValidatePixOrgaTermsOfService() {
    return this._formatValidatedTermsOfServiceText(
      this.args.pixOrgaTermsOfServiceAccepted,
      this.args.lastPixOrgaTermsOfServiceValidatedAt,
    );
  }

  get userHasValidatePixCertifTermsOfService() {
    return this._formatValidatedTermsOfServiceText(
      this.args.pixCertifTermsOfServiceAccepted,
      this.args.lastPixCertifTermsOfServiceValidatedAt,
    );
  }
  _formatValidatedTermsOfServiceText(hasValidatedTermsOfService, date) {
    if (!hasValidatedTermsOfService) {
      return this.intl.t('components.users.user-detail-personal-information.cgu.validation.status.non-validated');
    }

    return date
      ? this.intl.t('components.users.user-detail-personal-information.cgu.validation.status.validated-with-date', {
          formattedDate: this.intl.formatDate(date),
        })
      : this.intl.t('components.users.user-detail-personal-information.cgu.validation.status.validated');
  }

  <template>
    <DescriptionList aria-label={{t "components.users.user-detail-personal-information.cgu.title"}}>
      <DescriptionList.Item
        @label={{t "components.users.user-detail-personal-information.cgu.validation.domain.pix-app"}}
      >
        {{this.userHasValidatePixAppTermsOfService}}
      </DescriptionList.Item>

      <DescriptionList.Item
        @label={{t "components.users.user-detail-personal-information.cgu.validation.domain.pix-orga"}}
      >
        {{this.userHasValidatePixOrgaTermsOfService}}
      </DescriptionList.Item>

      <DescriptionList.Item
        @label={{t "components.users.user-detail-personal-information.cgu.validation.domain.pix-certif"}}
      >
        {{this.userHasValidatePixCertifTermsOfService}}
      </DescriptionList.Item>
    </DescriptionList>
  </template>
}
