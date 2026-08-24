/* eslint ember/no-computed-properties-in-native-classes: 0 */

import { computed } from '@ember/object';
import { service } from '@ember/service';
import Model, { attr, belongsTo } from '@warp-drive/legacy/model';

export const assessmentResultStatus = {
  CANCELLED: 'cancelled',
  VALIDATED: 'validated',
  REJECTED: 'rejected',
};

const CORE_FRAMEWORKS = ['CORE', 'CLEA'];

const professionalizingDate = new Date('2022-01-01');

export default class Certification extends Model {
  // attributes
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('date-only') birthdate;
  @attr('string') birthplace;
  @attr('date') date;
  @attr('date') deliveredAt;
  @attr('boolean') isPublished;
  @attr('string') certificationCenter;
  @attr('string') commentForCandidate;
  @attr('number') pixScore;
  @attr('string') status;
  @attr('string') verificationCode;
  // eslint-disable-next-line ember/no-empty-attrs
  @attr() certifiedBadgeImages;
  @attr('number') maxReachableLevelOnCertificationDate;
  @attr('number') version;
  @attr('number') algorithmEngineVersion;
  @attr('string') globalLevelLabel;
  @attr('string') globalSummaryLabel;
  @attr('string') globalDescriptionLabel;
  @attr('date') certificationDate;
  @attr('string') level;
  @attr('string') acquiredComplementaryCertification;
  @attr('string') certificationFramework;
  @attr('string') badgeUrl;

  // includes
  @belongsTo('result-competence-tree', { async: true, inverse: null }) resultCompetenceTree;
  @belongsTo('user', { async: true, inverse: 'certifications' }) user;

  @computed('certifiedBadgeImages.length')
  get hasAcquiredComplementaryCertifications() {
    return this.certifiedBadgeImages?.length > 0;
  }

  @computed('firstName', 'lastName')
  get fullName() {
    return this.firstName + ' ' + this.lastName;
  }

  get shouldDisplayProfessionalizingWarning() {
    return (
      this.version === 2 &&
      this.currentDomain.isFranceDomain &&
      new Date(this.deliveredAt).getTime() >= professionalizingDate.getTime()
    );
  }

  get isV3() {
    return this.algorithmEngineVersion === 3;
  }

  get hasPixPlusFramework() {
    return !CORE_FRAMEWORKS.includes(this.certificationFramework);
  }

  get maxReachablePixCountOnCertificationDate() {
    return this.maxReachableLevelOnCertificationDate * 8 * 16;
  }

  get title() {
    const framework = this.certificationFramework || 'CORE';
    return this.intl.t(`pages.certificate.framework-title.${framework}`);
  }
  @service currentDomain;
  @service intl;
}
