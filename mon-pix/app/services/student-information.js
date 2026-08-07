import Service, { service } from '@ember/service';
import ENV from 'mon-pix/config/environment';

export default class StudentInformationService extends Service {
  @service requestManager;

  async submitStudentInformation({ firstName, lastName, ineIna, birthdate }) {
    const response = await this.requestManager.request({
      url: `${ENV.APP.API_HOST}/api/sco-organization-learners/account-recovery`,
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'student-information-for-account-recoveries',
          attributes: {
            'first-name': firstName,
            'last-name': lastName,
            'ine-ina': ineIna,
            birthdate,
          },
        },
      }),
    });
    const { attributes } = response.content.data;
    return {
      firstName: attributes['first-name'],
      lastName: attributes['last-name'],
      email: attributes['email'],
      username: attributes['username'],
      latestOrganizationName: attributes['latest-organization-name'],
    };
  }
}
