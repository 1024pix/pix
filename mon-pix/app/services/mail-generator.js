import Service from '@ember/service';
import moment from 'moment';

export default class MailGeneratorService extends Service {
  generateEmail = (challengeId, assessmentId, host, environment) => {

    const fullyQualifiedDomainName = (environment !== 'development') ? 'pix-infra.ovh' : 'localhost';

    let applicationReviewName = '';
    if (environment === 'integration' || environment === 'staging') {
      applicationReviewName = '+' + host.split('.')[0];
    }

    return `${challengeId}-${assessmentId}-${moment().format('DDMM')}${applicationReviewName}@${fullyQualifiedDomainName}`;
  };
}
