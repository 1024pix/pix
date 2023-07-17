import Component from '@glimmer/component';
import ENV from 'pix-admin/config/environment';
import { service } from '@ember/service';

export default class OrganizationInformationSection extends Component {
  @service oidcIdentityProviders;
  @service accessControl;

  get identityProviderName() {
    const GARIdentityProvider = { code: 'GAR', organizationName: 'GAR' };
    const allIdentityProviderList = [...this.oidcIdentityProviders.list, GARIdentityProvider];
    const identityProvider = allIdentityProviderList.findBy(
      'code',
      this.args.organization.identityProviderForCampaigns,
    );
    const identityProviderName = identityProvider?.organizationName;
    return identityProviderName ?? 'Aucun';
  }

  get externalURL() {
    const urlDashboardPrefix = ENV.APP.ORGANIZATION_DASHBOARD_URL;
    return urlDashboardPrefix && urlDashboardPrefix + this.args.organization.id;
  }
}
