import Model, { attr } from '@ember-data/model';
import { memberAction } from 'ember-api-actions';

export default class StudentInformation extends Model {

  // attributes
  @attr('string') ineIna;
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('date-only') birthdate;

  submitStudentInformation = memberAction({
    path: 'recover-account',
    type: 'post',
    urlType: 'recover-account',
    before() {
      const payload = this.serialize();
      return payload;
    },
    after(response) {
      if (response.data && response.data.attributes) {
        const deserializeResponse = {
          userId: response.data.attributes['user-id'],
          firstName: response.data.attributes['first-name'],
          lastName: response.data.attributes['last-name'],
          email: response.data.attributes['email'],
          username: response.data.attributes['username'],
          latestOrganizationName: response.data.attributes['latest-organization-name'],
        };
        return deserializeResponse;
      } else {
        return response;
      }
    },
  });
}
