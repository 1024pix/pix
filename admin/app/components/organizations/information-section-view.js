import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import ENV from 'pix-admin/config/environment';

export default class OrganizationInformationSection extends Component {
  @service oidcIdentityProviders;
  @service accessControl;
  @tracked tags;
  @tracked hasOrganizationChildren;

  constructor() {
    super(...arguments);
    if (this.args.organization.tags) {
      Promise.resolve(this.args.organization.tags).then((tags) => {
        this.tags = tags;
      });
    }
    if (this.args.organization.children) {
      Promise.resolve(this.args.organization.children).then((children) => {
        this.hasOrganizationChildren = children.length > 0;
      });
    }
  }

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
