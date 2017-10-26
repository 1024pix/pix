import Ember from 'ember';
import moment from 'moment';

export default Ember.Service.extend({

  generateEmail: (challengeId, assessmentId, host, environment) => {

    const fullyQualifiedDomainName = (environment !== 'development') ? 'pix-infra.ovh' : 'localhost';

    let applicationReviewName = '';
    if (environment === 'integration' || environment === 'staging') {
      applicationReviewName = '+' + host.split('.')[0];
    }

    return `${challengeId}-${assessmentId}-${moment().format('DDMM')}${applicationReviewName}@${fullyQualifiedDomainName}`;
  }

});
