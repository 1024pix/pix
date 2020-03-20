const { expect, knex, databaseBuilder } = require('../../../test-helper');
const certificationCenterMembershipRepository = require('../../../../lib/infrastructure/repositories/certification-center-membership-repository');
const BookshelfCertificationCenterMembership = require('../../../../lib/infrastructure/data/certification-center-membership');
const CertificationCenterMembership = require('../../../../lib/domain/models/CertificationCenterMembership');
const CertificationCenter = require('../../../../lib/domain/models/CertificationCenter');

describe('Integration | Repository | Certification Center Membership', () => {

  describe('#create', () => {
    let userId, certificationCenterId;
    beforeEach(async () => {
      userId = databaseBuilder.factory.buildUser({}).id;
      certificationCenterId = databaseBuilder.factory.buildCertificationCenter({}).id;
      await databaseBuilder.commit();
    });

    afterEach(() => {
      return knex('certification-center-memberships').delete();
    });

    it('should add a new membership in database', async () => {
      // given
      const countCertificationCenterMembershipsBeforeCreate = await BookshelfCertificationCenterMembership.count();

      // when
      await certificationCenterMembershipRepository.create(userId, certificationCenterId);

      // then
      const countCertificationCenterMembershipsAfterCreate = await BookshelfCertificationCenterMembership.count();
      expect(countCertificationCenterMembershipsAfterCreate).to.equal(countCertificationCenterMembershipsBeforeCreate + 1);
    });

    it('should return the certification center membership', async () => {
      // when
      const createdCertificationCenterMembership = await certificationCenterMembershipRepository.create(userId, certificationCenterId);

      // then
      expect(createdCertificationCenterMembership).to.be.an.instanceOf(CertificationCenterMembership);
    });

    context('Error cases', () => {

      beforeEach(async () => {
        // given
        databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
        await databaseBuilder.commit();
      });

      it('should throw an error when a membership already exist for user + certificationCenter', () => {
        // when
        const promise = certificationCenterMembershipRepository.create(userId, certificationCenterId);

        // then
        return expect(promise).to.have.been.rejectedWith(Error);
      });

    });

  });

  describe('#findByUserId', () => {

    let userAsked, expectedCertificationCenter, expectedCertificationCenterMembership;
    beforeEach(async () => {
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
      await databaseBuilder.commit();
    });

    it('should return certification center membership associated to the user', () => {
      // when
      const promise = certificationCenterMembershipRepository.findByUserId(userAsked.id);

      // then
      return promise.then((certificationCenterMemberships) => {
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
  });

});
