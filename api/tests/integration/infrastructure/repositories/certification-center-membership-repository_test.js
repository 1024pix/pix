const { expect, knex, databaseBuilder, catchErr } = require('../../../test-helper');
const certificationCenterMembershipRepository = require('../../../../lib/infrastructure/repositories/certification-center-membership-repository');
const BookshelfCertificationCenterMembership = require('../../../../lib/infrastructure/data/certification-center-membership');
const CertificationCenterMembership = require('../../../../lib/domain/models/CertificationCenterMembership');
const CertificationCenter = require('../../../../lib/domain/models/CertificationCenter');
const { AlreadyExistingMembershipError } = require('../../../../lib/domain/errors');

describe('Integration | Repository | Certification Center Membership', () => {

  describe('#save', () => {
    let userId, certificationCenterId;

    beforeEach(() => {
      userId = databaseBuilder.factory.buildUser({}).id;
      certificationCenterId = databaseBuilder.factory.buildCertificationCenter({}).id;
      return databaseBuilder.commit();
    });

    afterEach(() => {
      return knex('certification-center-memberships').delete();
    });

    it('should add a new membership in database', async () => {
      // given
      const countCertificationCenterMembershipsBeforeCreate = await BookshelfCertificationCenterMembership.count();

      // when
      await certificationCenterMembershipRepository.save(userId, certificationCenterId);

      // then
      const countCertificationCenterMembershipsAfterCreate = await BookshelfCertificationCenterMembership.count();
      expect(countCertificationCenterMembershipsAfterCreate).to.equal(countCertificationCenterMembershipsBeforeCreate + 1);
    });

    it('should return the certification center membership', async () => {
      // when
      const createdCertificationCenterMembership = await certificationCenterMembershipRepository.save(userId, certificationCenterId);

      // then
      expect(createdCertificationCenterMembership).to.be.an.instanceOf(CertificationCenterMembership);
    });

    context('Error cases', () => {

      beforeEach(() => {
        databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
        return databaseBuilder.commit();
      });

      it('should throw an error when a membership already exist for user + certificationCenter', async () => {
        // when
        const error = await catchErr(certificationCenterMembershipRepository.save)(userId, certificationCenterId);

        // then
        expect(error).to.be.instanceOf(AlreadyExistingMembershipError);
      });

    });

  });

  describe('#findByUserId', () => {

    let userAsked, expectedCertificationCenter, expectedCertificationCenterMembership;

    beforeEach(() => {
      userAsked = databaseBuilder.factory.buildUser();
      const otherUser = databaseBuilder.factory.buildUser();
      expectedCertificationCenter = databaseBuilder.factory.buildCertificationCenter();
      const otherCertificationCenter = databaseBuilder.factory.buildCertificationCenter();
      expectedCertificationCenterMembership = databaseBuilder.factory.buildCertificationCenterMembership({
        userId: userAsked.id,
        certificationCenterId: expectedCertificationCenter.id
      });
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId: otherUser.id,
        certificationCenterId: otherCertificationCenter.id
      });
      return databaseBuilder.commit();
    });

    it('should return certification center membership associated to the user', async () => {
      // when
      const certificationCenterMemberships = await certificationCenterMembershipRepository.findByUserId(userAsked.id);

      // then
      expect(certificationCenterMemberships).to.be.an('array');

      const certificationCenterMembership = certificationCenterMemberships[0];
      expect(certificationCenterMembership).to.be.an.instanceof(CertificationCenterMembership);
      expect(certificationCenterMembership.id).to.equal(expectedCertificationCenterMembership.id);

      const associatedCertificationCenter = certificationCenterMembership.certificationCenter;
      expect(associatedCertificationCenter).to.be.an.instanceof(CertificationCenter);
      expect(associatedCertificationCenter.id).to.equal(expectedCertificationCenter.id);
      expect(associatedCertificationCenter.name).to.equal(expectedCertificationCenter.name);
    });
  });

  describe('#doesUserHaveMembershipToCertificationCenter', () => {

    let userId;
    let certificationCenterInId;
    let certificationCenterNotInId;

    beforeEach(() => {
      userId = databaseBuilder.factory.buildUser().id;
      certificationCenterInId = databaseBuilder.factory.buildCertificationCenter().id;
      certificationCenterNotInId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId,
        certificationCenterId: certificationCenterInId,
      });
      return databaseBuilder.commit();
    });

    it('should return false if user has no membership in given certification center', async () => {
      // when
      const hasMembership = await certificationCenterMembershipRepository.doesUserHaveMembershipToCertificationCenter(userId, certificationCenterNotInId);

      // then
      expect(hasMembership).to.be.false;
    });

    it('should return true if user has membership in given certification center', async () => {
      // when
      const hasMembership = await certificationCenterMembershipRepository.doesUserHaveMembershipToCertificationCenter(userId, certificationCenterInId);

      // then
      expect(hasMembership).to.be.true;
    });
  });

});
