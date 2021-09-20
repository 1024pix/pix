const { expect, domainBuilder, sinon } = require('../../../test-helper');
const settings = require('../../../../lib/config');

describe('Unit | Domain | Read-Models | AllowedCertificationCenterAccess', function() {

  context('#isInWhitelist', function() {

    let originalEnvValueWhitelist, originalEnvValueDateCollege, originalEnvValueDateLycee;

    beforeEach(function() {
      originalEnvValueWhitelist = settings.features.pixCertifScoBlockedAccessWhitelist;
      originalEnvValueDateCollege = settings.features.pixCertifScoBlockedAccessDateCollege;
      originalEnvValueDateLycee = settings.features.pixCertifScoBlockedAccessDateLycee;
    });

    afterEach(function() {
      settings.features.pixCertifScoBlockedAccessWhitelist = originalEnvValueWhitelist;
      settings.features.pixCertifScoBlockedAccessDateCollege = originalEnvValueDateCollege;
      settings.features.pixCertifScoBlockedAccessDateLycee = originalEnvValueDateLycee;
    });

    it('should return true when certification center is in whitelist', function() {
      // given
      settings.features.pixCertifScoBlockedAccessWhitelist = ['EXAMPLE1', 'EXAMPLE2'];
      const allowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
        externalId: 'EXAMPLE2',
      });

      // when
      const isInWhiteList = allowedCertificationCenterAccess.isInWhitelist();

      // then
      expect(isInWhiteList).to.be.true;
    });

    it('should return false when certification center is not in whitelist', function() {
      // given
      settings.features.pixCertifScoBlockedAccessWhitelist = ['EXAMPLE1', 'EXAMPLE2'];
      const allowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
        externalId: 'EXAMPLE3',
      });

      // when
      const isInWhiteList = allowedCertificationCenterAccess.isInWhitelist();

      // then
      expect(isInWhiteList).to.be.false;
    });

    it('should be case insensitive', function() {
      // given
      settings.features.pixCertifScoBlockedAccessWhitelist = ['EXAMPLE1', 'EXAMPLE2'];
      const allowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
        externalId: 'exAmpLe1',
      });

      // when
      const isInWhiteList = allowedCertificationCenterAccess.isInWhitelist();

      // then
      expect(isInWhiteList).to.be.true;
    });
  });

  context('#isCollege', function() {

    it('should return false when certification center is not of type SCO', function() {
      // given
      const allowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
        type: 'NOT_SCO',
        isRelatedToManagingStudentsOrganization: true,
        relatedOrganizationTags: ['COLLEGE', 'some_other_tag'],
      });

      // when
      const isCollege = allowedCertificationCenterAccess.isCollege();

      // then
      expect(isCollege).to.be.false;
    });

    it('should return false when certification center is not related to a managing students organization', function() {
      // given
      const allowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
        type: 'SCO',
        isRelatedToManagingStudentsOrganization: false,
        relatedOrganizationTags: ['COLLEGE', 'some_other_tag'],
      });

      // when
      const isCollege = allowedCertificationCenterAccess.isCollege();

      // then
      expect(isCollege).to.be.false;
    });

    it('should return false when certification center has not the tag COLLEGE', function() {
      // given
      const allowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
        type: 'SCO',
        isRelatedToManagingStudentsOrganization: true,
        relatedOrganizationTags: ['COLLEuuuGE', 'some_other_tag'],
      });

      // when
      const isCollege = allowedCertificationCenterAccess.isCollege();

      // then
      expect(isCollege).to.be.false;
    });

    it('should return true when certification center is SCO, related to a managing students orga and has tag COLLEGE', function() {
      // given
      const allowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
        type: 'SCO',
        isRelatedToManagingStudentsOrganization: true,
        relatedOrganizationTags: ['COLLEGE', 'some_other_tag'],
      });

      // when
      const isCollege = allowedCertificationCenterAccess.isCollege();

      // then
      expect(isCollege).to.be.true;
    });
  });

  context('#isLycee', function() {

    it('should return false when certification center is not of type SCO', function() {
      // given
      const allowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
        type: 'NOT_SCO',
        isRelatedToManagingStudentsOrganization: true,
        relatedOrganizationTags: ['LYCEE', 'some_other_tag'],
      });

      // when
      const isLycee = allowedCertificationCenterAccess.isLycee();

      // then
      expect(isLycee).to.be.false;
    });

    it('should return false when certification center is not related to a managing students organization', function() {
      // given
      const allowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
        type: 'NOT_SCO',
        isRelatedToManagingStudentsOrganization: false,
        relatedOrganizationTags: ['LYCEE', 'some_other_tag'],
      });

      // when
      const isLycee = allowedCertificationCenterAccess.isLycee();

      // then
      expect(isLycee).to.be.false;
    });

    it('should return false when certification center has neither the tag LYCEE and LYCEE PRO', function() {
      // given
      const allowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
        type: 'SCO',
        isRelatedToManagingStudentsOrganization: true,
        relatedOrganizationTags: ['LYCEEeeee', 'some_other_tag'],
      });

      // when
      const isLycee = allowedCertificationCenterAccess.isLycee();

      // then
      expect(isLycee).to.be.false;
    });

    it('should return true when certification center is SCO, related to a managing students orga and has tag LYCEE', function() {
      // given
      const allowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
        type: 'SCO',
        isRelatedToManagingStudentsOrganization: true,
        relatedOrganizationTags: ['LYCEE', 'some_other_tag'],
      });

      // when
      const isLycee = allowedCertificationCenterAccess.isLycee();

      // then
      expect(isLycee).to.be.true;
    });

    it('should return true when certification center is SCO, related to a managing students orga and has tag LYCEE PRO', function() {
      // given
      const allowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
        type: 'SCO',
        isRelatedToManagingStudentsOrganization: true,
        relatedOrganizationTags: ['LYCEE PRO', 'some_other_tag'],
      });

      // when
      const isLycee = allowedCertificationCenterAccess.isLycee();

      // then
      expect(isLycee).to.be.true;
    });

    it('should return true when certification center is SCO, related to a managing students orga and has both tags LYCEE PRO and LYCEE', function() {
      // given
      const allowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
        type: 'SCO',
        isRelatedToManagingStudentsOrganization: true,
        relatedOrganizationTags: ['LYCEE PRO', 'LYCEE', 'some_other_tag'],
      });

      // when
      const isLycee = allowedCertificationCenterAccess.isLycee();

      // then
      expect(isLycee).to.be.true;
    });
  });

  context('#hasTag', function() {

    it('should return false when certification center has not the given tag', function() {
      // given
      const allowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
        relatedOrganizationTags: ['tagOne'],
      });

      // when
      const hasTag = allowedCertificationCenterAccess.hasTag('tagTwo');

      // then
      expect(hasTag).to.be.false;
    });

    it('should return true when certification center has the given tag', function() {
      // given
      const allowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
        relatedOrganizationTags: ['tagOne'],
      });

      // when
      const hasTag = allowedCertificationCenterAccess.hasTag('tagOne');

      // then
      expect(hasTag).to.be.true;
    });
  });

  context('#isAccessBlockedCollege', function() {
    let clock;
    let validData;

    beforeEach(function() {
      clock = sinon.useFakeTimers(new Date('2020-01-01'));
      settings.features.pixCertifScoBlockedAccessWhitelist = ['WHITELISTED'];
      settings.features.pixCertifScoBlockedAccessDateCollege = '2021-01-01';
      validData = {
        externalId: 'NOT_WHITELISTED',
        type: 'SCO',
        isRelatedToManagingStudentsOrganization: true,
        relatedOrganizationTags: ['COLLEGE', 'some_other_tag'],
      };
    });

    afterEach(function() {
      clock.restore();
    });

    it('should return false when certification center is not a college', function() {
      // given
      const allowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
        ...validData,
        relatedOrganizationTags: ['COLLEGEee', 'some_other_tag'],
      });

      // when
      const isAccessBlockedCollege = allowedCertificationCenterAccess.isAccessBlockedCollege();

      // then
      expect(isAccessBlockedCollege).to.be.false;
    });

    it('should return false when certification center is also a lycee', function() {
      // given
      const allowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
        ...validData,
        relatedOrganizationTags: ['COLLEGE', 'LYCEE', 'some_other_tag'],
      });

      // when
      const isAccessBlockedCollege = allowedCertificationCenterAccess.isAccessBlockedCollege();

      // then
      expect(isAccessBlockedCollege).to.be.false;
    });

    it('should return false when certification center is whitelisted', function() {
      // given
      const allowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
        ...validData,
        externalId: 'WHITELISTED',
      });

      // when
      const isAccessBlockedCollege = allowedCertificationCenterAccess.isAccessBlockedCollege();

      // then
      expect(isAccessBlockedCollege).to.be.false;
    });

    it('should return false when current date is after the college date limit', function() {
      // given
      clock = sinon.useFakeTimers(new Date('2022-01-01'));
      const allowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess(validData);

      // when
      const isAccessBlockedCollege = allowedCertificationCenterAccess.isAccessBlockedCollege();

      // then
      expect(isAccessBlockedCollege).to.be.false;
    });

    it('should return true otherwise all above conditions', function() {
      // given
      const allowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess(validData);

      // when
      const isAccessBlockedCollege = allowedCertificationCenterAccess.isAccessBlockedCollege();

      // then
      expect(isAccessBlockedCollege).to.be.true;
    });
  });

  context('#isAccessBlockedLycee', function() {
    let clock;
    let validData;

    beforeEach(function() {
      clock = sinon.useFakeTimers(new Date('2020-01-01'));
      settings.features.pixCertifScoBlockedAccessWhitelist = ['WHITELISTED'];
      settings.features.pixCertifScoBlockedAccessDateLycee = '2021-01-01';
      validData = {
        externalId: 'NOT_WHITELISTED',
        type: 'SCO',
        isRelatedToManagingStudentsOrganization: true,
        relatedOrganizationTags: ['LYCEE PRO', 'some_other_tag'],
      };
    });

    afterEach(function() {
      clock.restore();
    });

    it('should return false when certification center is not a lycee', function() {
      // given
      const allowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
        ...validData,
        relatedOrganizationTags: ['LYCEE PROU', 'some_other_tag'],
      });

      // when
      const isAccessBlockedLycee = allowedCertificationCenterAccess.isAccessBlockedLycee();

      // then
      expect(isAccessBlockedLycee).to.be.false;
    });

    it('should return false when certification center is whitelisted', function() {
      // given
      const allowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
        ...validData,
        externalId: 'WHITELISTED',
      });

      // when
      const isAccessBlockedLycee = allowedCertificationCenterAccess.isAccessBlockedLycee();

      // then
      expect(isAccessBlockedLycee).to.be.false;
    });

    it('should return false when current date is after the lycee date limit', function() {
      // given
      clock = sinon.useFakeTimers(new Date('2022-01-01'));
      const allowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess(validData);

      // when
      const isAccessBlockedLycee = allowedCertificationCenterAccess.isAccessBlockedLycee();

      // then
      expect(isAccessBlockedLycee).to.be.false;
    });

    it('should return true otherwise all above conditions', function() {
      // given
      const allowedCertificationCenterAccessLycee = domainBuilder.buildAllowedCertificationCenterAccess({
        ...validData,
        relatedOrganizationTags: ['LYCEE'],
      });
      const allowedCertificationCenterAccessLyceePro = domainBuilder.buildAllowedCertificationCenterAccess({
        ...validData,
        relatedOrganizationTags: ['LYCEE PRO'],
      });

      // when
      const isAccessBlockedLycee = allowedCertificationCenterAccessLycee.isAccessBlockedLycee();
      const isAccessBlockedLyceePro = allowedCertificationCenterAccessLyceePro.isAccessBlockedLycee();

      // then
      expect(isAccessBlockedLycee).to.be.true;
      expect(isAccessBlockedLyceePro).to.be.true;
    });
  });

  context('#isScoManagingStudents', function() {

    it('should return false when certification center is not of type SCO', function() {
      // given
      const allowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
        type: 'PRO',
        isRelatedToManagingStudentsOrganization: true,
      });

      // when
      const isScoManagingStudents = allowedCertificationCenterAccess.isScoManagingStudents();

      // then
      expect(isScoManagingStudents).to.be.false;
    });

    it('should return false when certification center is not related to a managing students organization', function() {
      // given
      const allowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
        type: 'SCO',
        isRelatedToManagingStudentsOrganization: false,
      });

      // when
      const isScoManagingStudents = allowedCertificationCenterAccess.isScoManagingStudents();

      // then
      expect(isScoManagingStudents).to.be.false;
    });

    it('should return true when certification center is of type SCO and related to a managing students organization', function() {
      // given
      const allowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
        type: 'SCO',
        isRelatedToManagingStudentsOrganization: true,
      });

      // when
      const isScoManagingStudents = allowedCertificationCenterAccess.isScoManagingStudents();

      // then
      expect(isScoManagingStudents).to.be.true;
    });
  });
});
