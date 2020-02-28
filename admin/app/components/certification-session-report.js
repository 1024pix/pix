import { classNames } from '@ember-decorators/component';
import { action, computed } from '@ember/object';
import { filter, filterBy } from '@ember/object/computed';
import Component from '@glimmer/component';
import _ from 'lodash';

@classNames('certification-session-report')
export default class CertificationSessionReport extends Component {
  @filterBy('certifications', 'isInSession', false)
  outOfSessionCertifications;

  @filter('certifications', function(certification) {
    return !certification.lastName
      ||   !certification.firstName
      ||   !certification.birthdate
      ||   !certification.birthplace
      ||   !certification.id;
  })
  incompleteCertifications;

  @computed('certifications')
  get duplicateCertificationIds() {
    const certificationsGroupedByCertifId = _.groupBy(this.certifications, (certification) => {
      return certification.id;
    });
    return _.compact(_.map(certificationsGroupedByCertifId, (certifications, certificationId) => {
      if (certifications.length > 1) {
        return certificationId;
      }
    }));
  }

  @filterBy('certifications', 'hasSeenEndTestScreen', false)
  noLastScreenSeenCertifications;

  @filter('certifications', function(certification) {
    return !_.isEmpty(certification.examinerComment);
  })
  commentedByExaminerCertifications;

  @action
  toggleSection(sectionName) {
    this.toggleProperty(sectionName);
  }
}
