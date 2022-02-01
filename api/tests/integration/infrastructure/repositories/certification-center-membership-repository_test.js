const pick = require('lodash/pick');
const omit = require('lodash/omit');

const { expect, knex, databaseBuilder, catchErr, sinon } = require('../../../test-helper');

const BookshelfCertificationCenterMembership = require('../../../../lib/infrastructure/orm-models/CertificationCenterMembership');
const CertificationCenter = require('../../../../lib/domain/models/CertificationCenter');
const CertificationCenterMembership = require('../../../../lib/domain/models/CertificationCenterMembership');
const User = require('../../../../lib/domain/models/User');

const {
  CertificationCenterMembershipDisableError,
  AlreadyExistingMembershipError,
} = require('../../../../lib/domain/errors');

const certificationCenterMembershipRepository = require('../../../../lib/infrastructure/repositories/certification-center-membership-repository');

describe('Integration | Repository | Certification Center Membership', function () {
  describe('#save', function () {
    let userId, certificationCenterId;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser({}).id;
      certificationCenterId = databaseBuilder.factory.buildCertificationCenter({}).id;
      await databaseBuilder.commit();
    });

    afterEach(async function () {
      await knex('certification-center-memberships').delete();
    });

    it('should add a new membership in database', async function () {
      // given
      const countCertificationCenterMembershipsBeforeCreate = await BookshelfCertificationCenterMembership.count();

      // when
      await certificationCenterMembershipRepository.save({ userId, certificationCenterId });

      // then
      const countCertificationCenterMembershipsAfterCreate = await BookshelfCertificationCenterMembership.count();
      expect(countCertificationCenterMembershipsAfterCreate).to.equal(
        countCertificationCenterMembershipsBeforeCreate + 1
      );
    });

    it('should return the certification center membership', async function () {
      // when
      const createdCertificationCenterMembership = await certificationCenterMembershipRepository.save({
        userId,
        certificationCenterId,
      });

      // then
      expect(createdCertificationCenterMembership).to.be.an.instanceOf(CertificationCenterMembership);
    });

    context('Error cases', function () {
      beforeEach(async function () {
        databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
        await databaseBuilder.commit();
      });

      it('should throw an error when a membership already exist for user + certificationCenter', async function () {
        // when
        const error = await catchErr(certificationCenterMembershipRepository.save)({ userId, certificationCenterId });

        // then
        expect(error).to.be.instanceOf(AlreadyExistingMembershipError);
      });
    });
  });

  describe('#findByUserId', function () {
    let userAsked, expectedCertificationCenter, expectedCertificationCenterMembership;

    beforeEach(async function () {
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

    it('should return certification center membership associated to the user', async function () {
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

  describe('#findActiveByCertificationCenterIdSortedById', function () {
    it('should return certification center membership associated to the certification center', async function () {
      // given
      const now = new Date('2021-01-02');
      const clock = sinon.useFakeTimers(now);

      const certificationCenter = databaseBuilder.factory.buildCertificationCenter({ updatedAt: now });
      const user = databaseBuilder.factory.buildUser();
      const certificationCenterMembership = databaseBuilder.factory.buildCertificationCenterMembership({
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
      const foundCertificationCenterMemberships =
        await certificationCenterMembershipRepository.findActiveByCertificationCenterIdSortedById({
          certificationCenterId: certificationCenter.id,
        });

      // then
      expect(foundCertificationCenterMemberships).to.be.an('array');

      const foundCertificationCenterMembership = foundCertificationCenterMemberships[0];
      expect(foundCertificationCenterMembership).to.be.an.instanceof(CertificationCenterMembership);
      expect(foundCertificationCenterMembership.id).to.equal(certificationCenterMembership.id);
      expect(foundCertificationCenterMembership.createdAt).to.deep.equal(certificationCenterMembership.createdAt);

      const { certificationCenter: associatedCertificationCenter, user: associatedUser } =
        foundCertificationCenterMembership;

      expect(associatedCertificationCenter).to.be.an.instanceof(CertificationCenter);
      expect(omit(associatedCertificationCenter, ['habilitations'])).to.deep.equal(certificationCenter);

      expect(associatedUser).to.be.an.instanceOf(User);
      expect(pick(associatedUser, ['id', 'firstName', 'lastName', 'email'])).to.deep.equal(expectedUser);
      clock.restore();
    });

    it('should return certification center membership sorted by id', async function () {
      // given
      const certificationCenter = databaseBuilder.factory.buildCertificationCenter();

      [30, 20, 10].forEach((id) => {
        databaseBuilder.factory.buildCertificationCenterMembership({
          id,
          certificationCenterId: certificationCenter.id,
          userId: databaseBuilder.factory.buildUser().id,
        });
      });
      await databaseBuilder.commit();

      // when
      const foundCertificationCenterMemberships =
        await certificationCenterMembershipRepository.findActiveByCertificationCenterIdSortedById({
          certificationCenterId: certificationCenter.id,
        });

      // then
      expect(foundCertificationCenterMemberships[0].id).to.equal(10);
      expect(foundCertificationCenterMemberships[1].id).to.equal(20);
      expect(foundCertificationCenterMemberships[2].id).to.equal(30);
    });

    it('should only return active (not disabled) certification center memberships', async function () {
      // given
      const now = new Date();
      const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
      const user1 = databaseBuilder.factory.buildUser();
      const user2 = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildCertificationCenterMembership({
        id: 7,
        userId: user1.id,
        certificationCenterId: certificationCenter.id,
      });
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId: user2.id,
        certificationCenterId: certificationCenter.id,
        disabledAt: now,
      });
      await databaseBuilder.commit();

      // when
      const foundCertificationCenterMemberships =
        await certificationCenterMembershipRepository.findActiveByCertificationCenterIdSortedById({
          certificationCenterId: certificationCenter.id,
        });

      // then
      expect(foundCertificationCenterMemberships.length).to.equal(1);
      expect(foundCertificationCenterMemberships[0].id).to.equal(7);
    });
  });

  describe('#findActiveByCertificationCenterIdSortedByNames', function () {
    it('should return certification center membership associated to the certification center', async function () {
      // given
      const now = new Date('2021-01-02');
      const clock = sinon.useFakeTimers(now);

      const certificationCenter = databaseBuilder.factory.buildCertificationCenter({ updatedAt: now });
      const user = databaseBuilder.factory.buildUser();
      const certificationCenterMembership = databaseBuilder.factory.buildCertificationCenterMembership({
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
      const foundCertificationCenterMemberships =
        await certificationCenterMembershipRepository.findActiveByCertificationCenterIdSortedByNames({
          certificationCenterId: certificationCenter.id,
        });

      // then
      expect(foundCertificationCenterMemberships).to.be.an('array');

      const foundCertificationCenterMembership = foundCertificationCenterMemberships[0];
      expect(foundCertificationCenterMembership).to.be.an.instanceof(CertificationCenterMembership);
      expect(foundCertificationCenterMembership.id).to.equal(certificationCenterMembership.id);

      expect(foundCertificationCenterMembership.user).to.be.an.instanceOf(User);
      expect(foundCertificationCenterMembership.user.lastName).to.be.equal(expectedUser.lastName);
      expect(foundCertificationCenterMembership.user.firstName).to.be.equal(expectedUser.firstName);
      clock.restore();
    });

    it('should return certification center memberships sorted by lastName and firstName', async function () {
      // given
      const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
      const user1 = databaseBuilder.factory.buildUser({ lastName: 'Abba' });
      const user4 = databaseBuilder.factory.buildUser({ lastName: 'Dodo', firstName: 'Jean' });
      const user3 = databaseBuilder.factory.buildUser({ lastName: 'Dodo', firstName: 'Alice' });
      const user2 = databaseBuilder.factory.buildUser({ lastName: 'Dada' });
      databaseBuilder.factory.buildCertificationCenterMembership({
        certificationCenterId: certificationCenter.id,
        userId: user1.id,
      });
      databaseBuilder.factory.buildCertificationCenterMembership({
        certificationCenterId: certificationCenter.id,
        userId: user4.id,
      });
      databaseBuilder.factory.buildCertificationCenterMembership({
        certificationCenterId: certificationCenter.id,
        userId: user3.id,
      });
      databaseBuilder.factory.buildCertificationCenterMembership({
        certificationCenterId: certificationCenter.id,
        userId: user2.id,
      });
      await databaseBuilder.commit();

      // when
      const foundCertificationCenterMemberships =
        await certificationCenterMembershipRepository.findActiveByCertificationCenterIdSortedByNames({
          certificationCenterId: certificationCenter.id,
        });

      // then
      const certificationCenterMembershipFound1 = foundCertificationCenterMemberships[0];
      expect(certificationCenterMembershipFound1.user.lastName).to.equal('Abba');

      const certificationCenterMembershipFound2 = foundCertificationCenterMemberships[1];
      expect(certificationCenterMembershipFound2.user.lastName).to.equal('Dada');

      const certificationCenterMembershipFound3 = foundCertificationCenterMemberships[2];
      expect(certificationCenterMembershipFound3.user.lastName).to.equal('Dodo');
      expect(certificationCenterMembershipFound3.user.firstName).to.equal('Alice');

      const certificationCenterMembershipFound4 = foundCertificationCenterMemberships[3];
      expect(certificationCenterMembershipFound4.user.lastName).to.equal('Dodo');
      expect(certificationCenterMembershipFound4.user.firstName).to.equal('Jean');
    });

    it('should only return active (not disabled) certification center memberships', async function () {
      // given
      const now = new Date();
      const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
      const user1 = databaseBuilder.factory.buildUser();
      const user2 = databaseBuilder.factory.buildUser();
      const activeCertificationCenterMembershipId = databaseBuilder.factory.buildCertificationCenterMembership({
        userId: user1.id,
        certificationCenterId: certificationCenter.id,
      }).id;
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId: user2.id,
        certificationCenterId: certificationCenter.id,
        disabledAt: now,
      });
      await databaseBuilder.commit();

      // when
      const foundCertificationCenterMemberships =
        await certificationCenterMembershipRepository.findActiveByCertificationCenterIdSortedByNames({
          certificationCenterId: certificationCenter.id,
        });

      // then
      expect(foundCertificationCenterMemberships.length).to.equal(1);
      expect(foundCertificationCenterMemberships[0].id).to.equal(activeCertificationCenterMembershipId);
    });
  });

  describe('#isMemberOfCertificationCenter', function () {
    it('should return false if user has no membership in given certification center', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const otherCertificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId,
        certificationCenterId,
      });
      await databaseBuilder.commit();

      // when
      const hasMembership = await certificationCenterMembershipRepository.isMemberOfCertificationCenter({
        userId,
        certificationCenterId: otherCertificationCenterId,
      });

      // then
      expect(hasMembership).to.be.false;
    });

    it('should return true if user has membership in given certification center', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId,
        certificationCenterId,
      });
      await databaseBuilder.commit();

      // when
      const hasMembership = await certificationCenterMembershipRepository.isMemberOfCertificationCenter({
        userId,
        certificationCenterId,
      });

      // then
      expect(hasMembership).to.be.true;
    });
  });

  describe('#disable', function () {
    const now = new Date('2019-01-01T05:06:07Z');
    let clock;

    beforeEach(function () {
      clock = sinon.useFakeTimers(now);
    });

    afterEach(function () {
      clock.restore();
    });

    context('When certification center membership exist', function () {
      it('should return the disabled membership', async function () {
        // given
        const certificationCenterMembershipId = 7;
        const userId = databaseBuilder.factory.buildUser().id;
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        const certiciationCenterMembership = databaseBuilder.factory.buildCertificationCenterMembership({
          id: certificationCenterMembershipId,
          userId,
          certificationCenterId,
          disabledAt: null,
        });
        await databaseBuilder.commit();

        // when
        await certificationCenterMembershipRepository.disableById({
          certificationCenterMembershipId,
        });

        // then
        const updatedCertificationCenterMembership = await knex('certification-center-memberships').first();
        expect(updatedCertificationCenterMembership.id).to.equal(certiciationCenterMembership.id);
        expect(updatedCertificationCenterMembership.disabledAt).to.deep.equal(now);
      });
    });

    context('When certification center membership does not exist', function () {
      it('should throw CertificationCenterMembershipDisableError', async function () {
        // given
        const id = 7;
        const wrongId = id + 1;
        const userId = databaseBuilder.factory.buildUser().id;
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        databaseBuilder.factory.buildCertificationCenterMembership({
          id,
          userId,
          certificationCenterId,
        });
        await databaseBuilder.commit();

        // when
        const error = await catchErr(certificationCenterMembershipRepository.disableById)({
          certificationCenterMembershipId: wrongId,
        });

        // then
        expect(error).to.be.an.instanceOf(CertificationCenterMembershipDisableError);
        expect(error.message).to.be.equal('Erreur lors de la mise à jour du membership de centre de certification.');
      });
    });
  });
});
