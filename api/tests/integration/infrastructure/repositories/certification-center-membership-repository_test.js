const pick = require('lodash/pick');

const { expect, knex, databaseBuilder, catchErr } = require('../../../test-helper');

const BookshelfCertificationCenterMembership = require('../../../../lib/infrastructure/data/certification-center-membership');
const CertificationCenter = require('../../../../lib/domain/models/CertificationCenter');
const CertificationCenterMembership = require('../../../../lib/domain/models/CertificationCenterMembership');
const User = require('../../../../lib/domain/models/User');

const { AlreadyExistingMembershipError } = require('../../../../lib/domain/errors');

const certificationCenterMembershipRepository = require('../../../../lib/infrastructure/repositories/certification-center-membership-repository');

describe('Integration | Repository | Certification Center Membership', function() {

  describe('#save', function() {

    let userId, certificationCenterId;

    beforeEach(async function() {
      userId = databaseBuilder.factory.buildUser({}).id;
      certificationCenterId = databaseBuilder.factory.buildCertificationCenter({}).id;
      await databaseBuilder.commit();
    });

    afterEach(async function() {
      await knex('certification-center-memberships').delete();
    });

    it('should add a new membership in database', async function() {
      // given
      const countCertificationCenterMembershipsBeforeCreate = await BookshelfCertificationCenterMembership.count();

      // when
      await certificationCenterMembershipRepository.save(userId, certificationCenterId);

      // then
      const countCertificationCenterMembershipsAfterCreate = await BookshelfCertificationCenterMembership.count();
      expect(countCertificationCenterMembershipsAfterCreate).to.equal(countCertificationCenterMembershipsBeforeCreate + 1);
    });

    it('should return the certification center membership', async function() {
      // when
      const createdCertificationCenterMembership = await certificationCenterMembershipRepository.save(userId, certificationCenterId);

      // then
      expect(createdCertificationCenterMembership).to.be.an.instanceOf(CertificationCenterMembership);
    });

    context('Error cases', function() {

      beforeEach(async function() {
        databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
        await databaseBuilder.commit();
      });

      it('should throw an error when a membership already exist for user + certificationCenter', async function() {
        // when
        const error = await catchErr(certificationCenterMembershipRepository.save)(userId, certificationCenterId);

        // then
        expect(error).to.be.instanceOf(AlreadyExistingMembershipError);
      });
    });
  });

  describe('#findByUserId', function() {

    let userAsked, expectedCertificationCenter, expectedCertificationCenterMembership;

    beforeEach(async function() {
      userAsked = databaseBuilder.factory.buildUser();
      const otherUser = databaseBuilder.factory.buildUser();
      expectedCertificationCenter = databaseBuilder.factory.buildCertificationCenter();
      const otherCertificationCenter = databaseBuilder.factory.buildCertificationCenter();
      expectedCertificationCenterMembership = databaseBuilder.factory.buildCertificationCenterMembership({
        userId: userAsked.id,
        certificationCenterId: expectedCertificationCenter.id,
      });
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId: otherUser.id,
        certificationCenterId: otherCertificationCenter.id,
      });
      await databaseBuilder.commit();
    });

    it('should return certification center membership associated to the user', async function() {
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

  describe('#findByCertificationCenterId', function() {

    let certificationCenter;
    let certificationCenterMembership;
    let user;

    beforeEach(async function() {
      certificationCenter = databaseBuilder.factory.buildCertificationCenter();
      user = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();
    });

    it('should return certification center membership associated to the certification center', async function() {
      // given
      certificationCenterMembership = databaseBuilder.factory.buildCertificationCenterMembership({
        certificationCenterId: certificationCenter.id,
        userId: user.id,
      });
      const expectedUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      };
      await databaseBuilder.commit();

      // when
      const foundCertificationCenterMemberships = await certificationCenterMembershipRepository.findByCertificationCenterId(certificationCenter.id);

      // then
      expect(foundCertificationCenterMemberships).to.be.an('array');

      const foundCertificationCenterMembership = foundCertificationCenterMemberships[0];
      expect(foundCertificationCenterMembership).to.be.an.instanceof(CertificationCenterMembership);
      expect(foundCertificationCenterMembership.id).to.equal(certificationCenterMembership.id);
      expect(foundCertificationCenterMembership.createdAt).to.deep.equal(certificationCenterMembership.createdAt);

      const {
        certificationCenter: associatedCertificationCenter,
        user: associatedUser,
      } = foundCertificationCenterMembership;

      expect(associatedCertificationCenter).to.be.an.instanceof(CertificationCenter);
      expect(associatedCertificationCenter).to.deep.equal(certificationCenter);

      expect(associatedUser).to.be.an.instanceOf(User);
      expect(pick(associatedUser, ['id', 'firstName', 'lastName', 'email']))
        .to.deep.equal(expectedUser);
    });

    it('should return certification center membership sorted by id', async function() {
      // given
      [30, 20, 10].forEach((id) => {
        databaseBuilder.factory.buildCertificationCenterMembership({
          id,
          certificationCenterId: certificationCenter.id,
          userId: databaseBuilder.factory.buildUser().id,
        });
      });
      await databaseBuilder.commit();

      // when
      const foundCertificationCenterMemberships = await certificationCenterMembershipRepository.findByCertificationCenterId(certificationCenter.id);

      // then
      expect(foundCertificationCenterMemberships[0].id).to.equal(10);
      expect(foundCertificationCenterMemberships[1].id).to.equal(20);
      expect(foundCertificationCenterMemberships[2].id).to.equal(30);
    });
  });

  describe('#isMemberOfCertificationCenter', function() {

    let userId;
    let certificationCenterInId;
    let certificationCenterNotInId;

    beforeEach(async function() {
      userId = databaseBuilder.factory.buildUser().id;
      certificationCenterInId = databaseBuilder.factory.buildCertificationCenter().id;
      certificationCenterNotInId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId,
        certificationCenterId: certificationCenterInId,
      });
      await databaseBuilder.commit();
    });

    it('should return false if user has no membership in given certification center', async function() {
      // when
      const hasMembership = await certificationCenterMembershipRepository.isMemberOfCertificationCenter(userId, certificationCenterNotInId);

      // then
      expect(hasMembership).to.be.false;
    });

    it('should return true if user has membership in given certification center', async function() {
      // when
      const hasMembership = await certificationCenterMembershipRepository.isMemberOfCertificationCenter(userId, certificationCenterInId);

      // then
      expect(hasMembership).to.be.true;
    });
  });

  describe('#doesUserHaveMembershipToAnyCertificationCenter', function() {

    it('should return false if user has no membership to any certification center', async function() {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const someOtherUserId = databaseBuilder.factory.buildUser().id;
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId: someOtherUserId, certificationCenterId });
      await databaseBuilder.commit();

      // when
      const hasMembership = await certificationCenterMembershipRepository.doesUserHaveMembershipToAnyCertificationCenter(userId);

      // then
      expect(hasMembership).to.be.false;
    });

    it('should return true if user has membership in a certification center', async function() {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
      await databaseBuilder.commit();

      // when
      const hasMembership = await certificationCenterMembershipRepository.doesUserHaveMembershipToAnyCertificationCenter(userId);

      // then
      expect(hasMembership).to.be.true;
    });
  });

});
