import Service, { service } from '@ember/service';
import ENV from 'mon-pix/config/environment';

export default class ConfigService extends Service {
  @service requestManager;

  featureToggles = {};
  autonomousCoursesOrganizationId;

  async load() {
    const response = await this.requestManager.request({
      url: `${ENV.APP.API_HOST}/api/config`,
      method: 'GET',
    });

    const { featureToggles, autonomousCoursesOrganizationId } = response.content;
    this.featureToggles = featureToggles;
    this.autonomousCoursesOrganizationId = autonomousCoursesOrganizationId;
  }
}
