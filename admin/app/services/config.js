import Service, { service } from '@ember/service';
import ENV from 'pix-admin/config/environment';

export default class ConfigService extends Service {
  @service requestManager;

  featureToggles = {};
  permitPixAdminLoginFromPassword = false;

  async load() {
    const response = await this.requestManager.request({
      url: `${ENV.APP.API_HOST}/api/config`,
      method: 'GET',
    });

    const { featureToggles, permitPixAdminLoginFromPassword } = response.content;
    this.featureToggles = featureToggles;
    this.permitPixAdminLoginFromPassword = permitPixAdminLoginFromPassword;
  }
}
