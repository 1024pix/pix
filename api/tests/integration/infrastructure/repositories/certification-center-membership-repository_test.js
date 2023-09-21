import lodash from 'lodash';
const { omit, pick } = lodash;

import { expect, knex, databaseBuilder, catchErr, sinon, domainBuilder } from '../../../test-helper.js';
import { BookshelfCertificationCenterMembership } from '../../../../lib/infrastructure/orm-models/CertificationCenterMembership.js';
import { CertificationCenter } from '../../../../lib/domain/models/CertificationCenter.js';
import { CertificationCenterMembership } from '../../../../lib/domain/models/CertificationCenterMembership.js';
import { User } from '../../../../lib/domain/models/User.js';
import {
  CertificationCenterMembershipDisableError,
  AlreadyExistingMembershipError,
  NotFoundError,
} from '../../../../lib/domain/errors.js';

import * as certificationCenterMembershipRepository from '../../../../lib/infrastructure/repositories/certification-center-membership-repository.js';

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
        countCertificationCenterMembershipsBeforeCreate + 1,
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

    context('when there is already a disabled membership for the same user and certification center', function () {
      it('should add a new membership in database', async function () {
        // given
        databaseBuilder.factory.buildMembership({ userId, certificationCenterId, disabledAt: new Date() });
        await databaseBuilder.commit();
        const countCertificationCenterMembershipsBeforeCreate = await BookshelfCertificationCenterMembership.count();

        // when
        await certificationCenterMembershipRepository.save({ userId, certificationCenterId });

        // then
        const countCertificationCenterMembershipsAfterCreate = await BookshelfCertificationCenterMembership.count();
        expect(countCertificationCenterMembershipsAfterCreate).to.equal(
          countCertificationCenterMembershipsBeforeCreate + 1,
        );
      });
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
      expect(certificationCenterMembership.id).to.deep.equal(expectedCertificationCenterMembership.id);

      const associatedCertificationCenter = certificationCenterMembership.certificationCenter;
      expect(associatedCertificationCenter).to.be.an.instanceof(CertificationCenter);
      expect(associatedCertificationCenter.id).to.equal(expectedCertificationCenter.id);
      expect(associatedCertificationCenter.name).to.equal(expectedCertificationCenter.name);
    });

    context('when the certification center membership is disabled', function () {
      it('should return an empty array', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        databaseBuilder.factory.buildCertificationCenterMembership({
          userId,
          certificationCenterId,
          disabledAt: new Date(),
        });
        await databaseBuilder.commit();

        // when
        const certificationCenterMemberships = await certificationCenterMembershipRepository.findByUserId(userId);

        // then
        expect(certificationCenterMemberships).to.deep.equal([]);
      });
    });

    context('when an user has a disabled membership and a not disabled one', function () {
      it('should return the not disabled membership', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        databaseBuilder.factory.buildCertificationCenterMembership({
          userId,
          certificationCenterId,
          disabledAt: new Date(),
        });
        const notDisabledMembership = databaseBuilder.factory.buildCertificationCenterMembership({
          userId,
          certificationCenterId,
          disabledAt: null,
        });
        await databaseBuilder.commit();

        // when
        const certificationCenterMemberships = await certificationCenterMembershipRepository.findByUserId(userId);

        // then
        expect(certificationCenterMemberships.length).to.equal(1);
        expect(certificationCenterMemberships[0].id).to.equal(notDisabledMembership.id);
      });
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

    it('should return false if user has a disabled membership in given certification center', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId,
        certificationCenterId,
        disabledAt: new Date(),
      });
      await databaseBuilder.commit();

      // when
      const hasMembership = await certificationCenterMembershipRepository.isMemberOfCertificationCenter({
        userId,
        certificationCenterId,
      });

      // then
      expect(hasMembership).to.be.false;
    });

    it('should return true if user has a not disabled membership in given certification center', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId,
        certificationCenterId,
        disabledAt: null,
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

  describe('#disableById', function () {
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

  describe('#updateRefererStatusByUserIdAndCertificationCenterId', function () {
    it('should update isReferer on certification center membership', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId,
        certificationCenterId,
        disabledAt: null,
        isReferer: false,
      });

      databaseBuilder.factory.buildCertificationCenterMembership({ userId });
      await databaseBuilder.commit();

      // when
      await certificationCenterMembershipRepository.updateRefererStatusByUserIdAndCertificationCenterId({
        userId,
        certificationCenterId,
        isReferer: true,
      });

      // then
      const updatedCertificationCenterMembership = await knex('certification-center-memberships')
        .where({
          userId,
          certificationCenterId,
        })
        .first();
      expect(updatedCertificationCenterMembership.isReferer).to.be.true;
    });
  });

  describe('#getRefererByCertificationCenterId', function () {
    context('when there is a referer', function () {
      it('should return the referer certification center membership', async function () {
        // given
        const user = databaseBuilder.factory.buildUser({ locale: 'fr-FR' });
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        const refererCertificationCenterMembership = databaseBuilder.factory.buildCertificationCenterMembership({
          userId: user.id,
          certificationCenterId,
          disabledAt: null,
          isReferer: true,
        });

        databaseBuilder.factory.buildCertificationCenterMembership({ userId: user.id });
        await databaseBuilder.commit();

        // when
        const result = await certificationCenterMembershipRepository.getRefererByCertificationCenterId({
          certificationCenterId,
        });

        // then
        expect(result.id).to.equal(refererCertificationCenterMembership.id);
        expect(result.user).to.deepEqualInstanceOmitting(domainBuilder.buildUser({ ...user }), [
          'cgu',
          'pixOrgaTermsOfServiceAccepted',
          'pixCertifTermsOfServiceAccepted',
          'emailConfirmedAt',
          'knowledgeElements',
          'lastName',
          'lastTermsOfServiceValidatedAt',
          'lastPixOrgaTermsOfServiceValidatedAt',
          'lastPixCertifTermsOfServiceValidatedAt',
          'hasSeenAssessmentInstructions',
          'hasSeenNewDashboardInfo',
          'hasSeenFocusedChallengeTooltip',
          'hasSeenOtherChallengesTooltip',
          'mustValidateTermsOfService',
          'lang',
          'locale',
          'isAnonymous',
          'memberships',
          'certificationCenterMemberships',
          'pixScore',
          'scorecards',
          'campaignParticipations',
          'authenticationMethods',
          'username',
          'hasBeenAnonymised',
          'hasBeenAnonymisedBy',
        ]);
      });
    });

    context('when there is no referer', function () {
      it('should return null', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        databaseBuilder.factory.buildCertificationCenterMembership({
          userId,
          certificationCenterId,
          disabledAt: null,
          isReferer: false,
        });

        databaseBuilder.factory.buildCertificationCenterMembership({ userId });
        await databaseBuilder.commit();

        // when
        const result = await certificationCenterMembershipRepository.getRefererByCertificationCenterId({
          certificationCenterId,
        });

        // then
        expect(result).to.be.null;
      });
    });
  });

  describe('#disableMembershipsByUserId', function () {
    const now = new Date('2022-12-05');
    let clock;

    beforeEach(function () {
      clock = sinon.useFakeTimers(now);
    });

    afterEach(function () {
      clock.restore();
    });

    context('when there is multiple memberships for the specified user id', function () {
      it('disables all memberships', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const updatedByUserId = databaseBuilder.factory.buildUser().id;
        const firstCertificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        const secondCertificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        const firstMembership = databaseBuilder.factory.buildCertificationCenterMembership({
          userId,
          certificationCenterId: firstCertificationCenterId,
          createdAt: now,
        });
        const secondMembership = databaseBuilder.factory.buildCertificationCenterMembership({
          userId,
          certificationCenterId: secondCertificationCenterId,
          createdAt: now,
        });
        databaseBuilder.factory.buildCertificationCenterMembership({
          userId: databaseBuilder.factory.buildUser().id,
          certificationCenterId: secondCertificationCenterId,
          createdAt: now,
        });

        await databaseBuilder.commit();

        // when
        await certificationCenterMembershipRepository.disableMembershipsByUserId({ userId, updatedByUserId });

        // then
        const expectedMemberships = [
          {
            ...firstMembership,
            createdAt: now,
            disabledAt: now,
            updatedByUserId,
          },
          {
            ...secondMembership,
            createdAt: now,
            disabledAt: now,
            updatedByUserId,
          },
        ];
        const disabledMemberships = await knex('certification-center-memberships')
          .returning('*')
          .whereNotNull('disabledAt')
          .where({ userId });
        expect(disabledMemberships.length).to.equal(2);
        expect(disabledMemberships).to.deep.include.members(expectedMemberships);
      });

      it('disables only the memberships which are not yet disabled', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const updatedByUserId = databaseBuilder.factory.buildUser().id;
        const firstCertificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        const secondCertificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        const firstMembership = databaseBuilder.factory.buildCertificationCenterMembership({
          userId,
          certificationCenterId: firstCertificationCenterId,
          createdAt: now,
        });
        const secondMembership = databaseBuilder.factory.buildCertificationCenterMembership({
          userId,
          updatedByUserId,
          certificationCenterId: secondCertificationCenterId,
          createdAt: now,
          disabledAt: now,
        });
        databaseBuilder.factory.buildCertificationCenterMembership({
          userId: databaseBuilder.factory.buildUser().id,
          certificationCenterId: secondCertificationCenterId,
          createdAt: now,
        });

        await databaseBuilder.commit();

        // when
        await certificationCenterMembershipRepository.disableMembershipsByUserId({ userId, updatedByUserId });

        // then
        const expectedMemberships = [
          {
            ...secondMembership,
          },
          {
            ...firstMembership,
            disabledAt: now,
            updatedByUserId,
          },
        ];
        const disabledMemberships = await knex('certification-center-memberships')
          .returning('*')
          .whereNotNull('disabledAt')
          .andWhere({ userId });
        expect(disabledMemberships.length).to.equal(2);
        expect(disabledMemberships).to.deep.include.members(expectedMemberships);
      });
    });

    context('when memberships are already disabled for the specified user id', function () {
      it('does nothing', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const updatedByUserId = databaseBuilder.factory.buildUser().id;
        const firstCertificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        const secondCertificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        databaseBuilder.factory.buildCertificationCenterMembership({
          userId,
          updatedByUserId,
          certificationCenterId: firstCertificationCenterId,
          createdAt: now,
          disabledAt: now,
        });
        databaseBuilder.factory.buildCertificationCenterMembership({
          userId,
          updatedByUserId,
          certificationCenterId: secondCertificationCenterId,
          createdAt: now,
          disabledAt: now,
        });
        databaseBuilder.factory.buildCertificationCenterMembership({
          userId: databaseBuilder.factory.buildUser().id,
          certificationCenterId: secondCertificationCenterId,
          createdAt: now,
        });

        await databaseBuilder.commit();

        // when
        await certificationCenterMembershipRepository.disableMembershipsByUserId({ userId, updatedByUserId });

        // then
        const disabledMemberships = await knex('certification-center-memberships')
          .returning('*')
          .whereNotNull('disabledAt')
          .andWhere({ userId });
        expect(disabledMemberships.length).to.equal(2);
      });
    });
  });

  describe('#update', function () {
    const now = new Date('2023-09-12');

    it('updates user membership from "MEMBER" to "ADMIN"', async function () {
      // given
      const updatedByUserId = databaseBuilder.factory.buildUser().id;
      const certificationCenterMembershipToUpdate = databaseBuilder.factory.buildCertificationCenterMembership({
        role: 'MEMBER',
      });
      const certificationCenterMembership = new CertificationCenterMembership({
        ...certificationCenterMembershipToUpdate,
        role: 'ADMIN',
        updatedByUserId,
        updatedAt: now,
      });
      await databaseBuilder.commit();

      // when
      await certificationCenterMembershipRepository.update(certificationCenterMembership);

      // then
      const updatedCertificationCenterMembership = await knex('certification-center-memberships')
        .where({ id: certificationCenterMembershipToUpdate.id })
        .first();

      expect(updatedCertificationCenterMembership.updatedByUserId).to.equal(updatedByUserId);
      expect(updatedCertificationCenterMembership.role).to.equal('ADMIN');
      expect(updatedCertificationCenterMembership.updatedAt).to.deep.equal(now);
    });
  });

  describe('#findById', function () {
    it('returns certification center membership', async function () {
      // given
      const certificationCenterMembershipId = databaseBuilder.factory.buildCertificationCenterMembership().id;
      await databaseBuilder.commit();

      // when
      const certificationCenterMembership = await certificationCenterMembershipRepository.findById(
        certificationCenterMembershipId,
      );

      // then
      expect(certificationCenterMembership).to.be.instanceof(CertificationCenterMembership);
      expect(certificationCenterMembership.id).to.equal(certificationCenterMembershipId);
    });

    context('when certification center membership does not exist', function () {
      it('throws an error', async function () {
        // when
        const error = await catchErr(certificationCenterMembershipRepository.findById)(15);

        // then
        expect(error).to.be.instanceof(NotFoundError);
        expect(error.message).to.equal('Cannot find a certification center membership for id 15');
      });
    });
  });
});
