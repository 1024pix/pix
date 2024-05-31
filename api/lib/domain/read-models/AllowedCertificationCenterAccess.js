import { CERTIFICATION_FEATURES } from '../../../src/certification/shared/domain/constants.js';
import { config } from '../../config.js';
const { features } = config;
class AllowedCertificationCenterAccess {
  constructor({ center, isRelatedToManagingStudentsOrganization, relatedOrganizationTags }) {
    this.id = center.id;
    this.name = center.name;
    this.externalId = center.externalId;
    this.type = center.type;
    this.habilitations = center.habilitations;
    this.isV3Pilot = center.isV3Pilot;
    this.isRelatedToManagingStudentsOrganization = isRelatedToManagingStudentsOrganization;
    this.relatedOrganizationTags = relatedOrganizationTags;
  }

  isAccessBlockedCollege() {
    return (
      this.isCollege() &&
      !this.isLycee() &&
      !this.isInWhitelist() &&
      new Date() < new Date(features.pixCertifScoBlockedAccessDateCollege)
    );
  }

  isAccessBlockedLycee() {
    return (
      this.isLycee() && !this.isInWhitelist() && new Date() < new Date(features.pixCertifScoBlockedAccessDateLycee)
    );
  }

  isAccessBlockedAEFE() {
    return this.isAEFE() && !this.isInWhitelist() && new Date() < new Date(features.pixCertifScoBlockedAccessDateLycee);
  }

  isAccessBlockedAgri() {
    return this.isAgri() && !this.isInWhitelist() && new Date() < new Date(features.pixCertifScoBlockedAccessDateLycee);
  }

  hasTag(tagName) {
    return this.relatedOrganizationTags.includes(tagName);
  }

  isCollege() {
    return this.isScoManagingStudents() && this.hasTag('COLLEGE');
  }

  isLycee() {
    return this.isScoManagingStudents() && (this.hasTag('LYCEE') || this.hasTag('LYCEE PRO'));
  }

  isAEFE() {
    return this.hasTag('AEFE');
  }

  isAgri() {
    return this.isScoManagingStudents() && this.hasTag('AGRICULTURE');
  }

  isScoManagingStudents() {
    return this.type === 'SCO' && this.isRelatedToManagingStudentsOrganization;
  }

  isInWhitelist() {
    return features.pixCertifScoBlockedAccessWhitelist.includes(this.externalId.toUpperCase());
  }

  get pixCertifScoBlockedAccessDateLycee() {
    return features.pixCertifScoBlockedAccessDateLycee ?? null;
  }

  get pixCertifScoBlockedAccessDateCollege() {
    return features.pixCertifScoBlockedAccessDateCollege ?? null;
  }

  get isComplementaryAlonePilot() {
    return this.features.includes(CERTIFICATION_FEATURES.CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE.key);
  }
}

export { AllowedCertificationCenterAccess };
