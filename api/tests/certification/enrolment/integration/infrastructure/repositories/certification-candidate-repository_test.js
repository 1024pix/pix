import _ from 'lodash';

import { CompanionPingInfo } from '../../../../../../src/certification/enrolment/domain/models/CompanionPingInfo.js';
import * as certificationCandidateRepository from '../../../../../../src/certification/enrolment/infrastructure/repositories/certification-candidate-repository.js';
import { ComplementaryCertification } from '../../../../../../src/certification/session-management/domain/models/ComplementaryCertification.js';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { SUBSCRIPTION_TYPES } from '../../../../../../src/certification/shared/domain/constants.js';
import {
  CertificationCandidateMultipleUserLinksWithinSessionError,
  NotFoundError,
} from '../../../../../../src/shared/domain/errors.js';
import { catchErr, databaseBuilder, domainBuilder, expect, knex } from '../../../../../test-helper.js';

describe('Integration | Repository | CertificationCandidate', function () {
  let sessionId;
  let candidateData;
  let candidateSavedData;
  let coreSubscription;

  beforeEach(async function () {
    sessionId = databaseBuilder.factory.buildSession().id;
    candidateData = {
      firstName: 'Lena',
      lastName: 'Rine',
      sex: 'F',
      birthPostalCode: '75000',
      birthINSEECode: '75001',
      birthCity: 'HaussmanPolis',
      externalId: 'ABCDEF123',
      birthdate: '1990-07-12',
      extraTimePercentage: 0.05,
      sessionId,
      birthProvinceCode: '66',
      birthCountry: 'France',
      email: 'lena.rine@example.net',
      resultRecipientEmail: 'lara.pafromage@example.com',
      userId: null,
      organizationLearnerId: null,
    };

    candidateSavedData = {
      ...candidateData,
      extraTimePercentage: '0.05',
      authorizedToStart: false,
      billingMode: null,
      prepaymentCode: null,
    };

    coreSubscription = {
      type: SUBSCRIPTION_TYPES.CORE,
      complementaryCertificationId: null,
    };

    await databaseBuilder.commit();
  });

  describe('linkToUser', function () {
    let certificationCandidate;
    let userId;

    beforeEach(function () {
      // given
      certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({ userId: null });
      databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: certificationCandidate.id });
      userId = databaseBuilder.factory.buildUser().id;

      return databaseBuilder.commit();
    });

    context('when the user is not linked to any candidate in the same session', function () {
      it('should successfully link the candidate to the user', async function () {
        // when
        await certificationCandidateRepository.linkToUser({ id: certificationCandidate.id, userId });

        // then
        const linkedCertificationCandidate = await knex('certification-candidates')
          .where({ id: certificationCandidate.id })
          .select('userId');
        expect(linkedCertificationCandidate[0].userId).to.equal(userId);
      });
    });

    context('when the user is already linked to a candidate in the same session', function () {
      beforeEach(function () {
        const candidate = databaseBuilder.factory.buildCertificationCandidate({
          userId,
          sessionId: certificationCandidate.sessionId,
        });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate.id });
        return databaseBuilder.commit();
      });

      it('should throw a CertificationCandidateMultipleUserLinksWithinSessionError', async function () {
        // when
        const result = await catchErr(certificationCandidateRepository.linkToUser)({
          id: certificationCandidate.id,
          userId,
        });

        // then
        expect(result).to.be.instanceOf(CertificationCandidateMultipleUserLinksWithinSessionError);
      });
    });
  });

  describe('#findBySessionId', function () {
    beforeEach(async function () {
      // given
      const anotherSessionId = databaseBuilder.factory.buildSession().id;
      _.each(
        [
          { lastName: 'Rine', firstName: 'Lena', sessionId },
          { lastName: 'Pafromage', firstName: 'Lara', sessionId },
          { lastName: 'Mate', firstName: 'Otto', sessionId },
          { lastName: 'Attrak', firstName: 'Pat', sessionId: anotherSessionId },
          { lastName: 'Registre', firstName: 'Jean', sessionId: anotherSessionId },
          { lastName: 'Damant', firstName: 'Evy', sessionId },
        ],
        (candidate) => {
          const aCandidate = databaseBuilder.factory.buildCertificationCandidate(candidate);
          databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: aCandidate.id });
        },
      );

      await databaseBuilder.commit();
    });

    context('when there are some certification candidates with the given session id', function () {
      it('should fetch, alphabetically sorted, the certification candidates with a specific session ID', async function () {
        // when
        const actualCandidates = await certificationCandidateRepository.findBySessionId(sessionId);

        // then
        expect(actualCandidates[0].firstName).to.equal('Evy');
        expect(actualCandidates[1].firstName).to.equal('Otto');
        expect(actualCandidates[2].firstName).to.equal('Lara');
        expect(actualCandidates[3].firstName).to.equal('Lena');
        expect(actualCandidates).to.have.lengthOf(4);
      });
    });

    context('when some returned candidates have complementary certification subscription', function () {
      it('return ordered candidates with associated subscription', async function () {
        // given
        const sessionId = databaseBuilder.factory.buildSession().id;
        const rockCertification = databaseBuilder.factory.buildComplementaryCertification({
          label: 'Pix+Rock',
          key: ComplementaryCertificationKeys.CLEA,
        });
        const ottoMate = databaseBuilder.factory.buildCertificationCandidate({
          lastName: 'Mate',
          firstName: 'Otto',
          sessionId,
        });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: ottoMate.id });
        const patAttrak = databaseBuilder.factory.buildCertificationCandidate({
          lastName: 'Attrak',
          firstName: 'Pat',
          sessionId,
        });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: patAttrak.id });
        const evyDamant = databaseBuilder.factory.buildCertificationCandidate({
          lastName: 'Damant',
          firstName: 'Evy',
          sessionId,
        });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: evyDamant.id });

        databaseBuilder.factory.buildComplementaryCertificationSubscription({
          complementaryCertificationId: rockCertification.id,
          certificationCandidateId: ottoMate.id,
        });
        databaseBuilder.factory.buildComplementaryCertificationSubscription({
          complementaryCertificationId: rockCertification.id,
          certificationCandidateId: patAttrak.id,
        });

        await databaseBuilder.commit();

        // when
        const candidates = await certificationCandidateRepository.findBySessionId(sessionId);

        // then
        expect(candidates).to.have.lengthOf(3);
        const firstCandidate = candidates[0];
        const secondCandidate = candidates[1];
        const thirdCandidate = candidates[2];

        expect(firstCandidate.firstName).to.equal('Pat');
        expect(firstCandidate.lastName).to.equal('Attrak');
        expect(firstCandidate.complementaryCertification).to.deepEqualInstance(
          new ComplementaryCertification({
            id: rockCertification.id,
            label: 'Pix+Rock',
            key: ComplementaryCertificationKeys.CLEA,
          }),
        );

        expect(secondCandidate.firstName).to.equal('Evy');
        expect(secondCandidate.lastName).to.equal('Damant');
        expect(secondCandidate.complementaryCertification).to.equal(null);

        expect(thirdCandidate.firstName).to.equal('Otto');
        expect(thirdCandidate.lastName).to.equal('Mate');
        expect(thirdCandidate.complementaryCertification).to.deepEqualInstance(
          new ComplementaryCertification({
            id: rockCertification.id,
            label: 'Pix+Rock',
            key: ComplementaryCertificationKeys.CLEA,
          }),
        );
      });
    });

    context('when there is no certification candidates with the given session ID', function () {
      it('should return an empty array', async function () {
        // when
        const actualCandidates = await certificationCandidateRepository.findBySessionId(-1);

        // then
        expect(actualCandidates).to.deep.equal([]);
      });
    });
  });

  describe('#findBySessionIdAndPersonalInfo', function () {
    context('when there is one certification candidate with the given info in the session', function () {
      it('should fetch the candidate ignoring case', async function () {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({
          ...candidateData,
          subscriptions: [domainBuilder.buildCoreSubscription()],
        });
        const candidate = databaseBuilder.factory.buildCertificationCandidate(certificationCandidate);
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate.id });
        await databaseBuilder.commit();
        const personalInfoAndId = {
          lastName: candidateData.lastName,
          firstName: candidateData.firstName,
          birthdate: candidateData.birthdate,
          sessionId,
        };

        // when
        const actualCandidates =
          await certificationCandidateRepository.findBySessionIdAndPersonalInfo(personalInfoAndId);

        // then
        expect(actualCandidates).to.have.lengthOf(1);
        expect(actualCandidates[0]).to.deep.equal(certificationCandidate);
      });

      it('should fetch the candidate ignoring special characters, non canonical characters and zero-width spaces', async function () {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({
          ...candidateData,
          subscriptions: [domainBuilder.buildCoreSubscription()],
        });
        const candidate = databaseBuilder.factory.buildCertificationCandidate(certificationCandidate);
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate.id });
        await databaseBuilder.commit();
        const zeroWidthSpaceChar = '​';
        const personalInfoAndId = {
          lastName: 'Rïn é',
          firstName: `l' e-n${zeroWidthSpaceChar}a`,
          birthdate: candidateData.birthdate,
          sessionId,
        };

        // when
        const actualCandidates =
          await certificationCandidateRepository.findBySessionIdAndPersonalInfo(personalInfoAndId);

        // then
        expect(actualCandidates).to.have.lengthOf(1);
        expect(actualCandidates[0]).to.deep.equal(certificationCandidate);
      });
    });

    context('when there is no certification candidates with the given info in the session', function () {
      let onlyCandidateInBDD;
      let notMatchingCandidateInfo;

      beforeEach(function () {
        onlyCandidateInBDD = {
          lastName: candidateData.lastName,
          firstName: candidateData.firstName,
          birthdate: candidateData.birthdate,
          sessionId,
        };
        const candidate = databaseBuilder.factory.buildCertificationCandidate(onlyCandidateInBDD);
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate.id });

        notMatchingCandidateInfo = {
          lastName: 'Jean',
          firstName: 'Michel',
          birthdate: '2018-01-01',
          sessionId,
        };

        return databaseBuilder.commit();
      });

      it('should not find any candidate', async function () {
        // when
        const actualCandidates =
          await certificationCandidateRepository.findBySessionIdAndPersonalInfo(notMatchingCandidateInfo);

        // then
        expect(actualCandidates).to.be.empty;
      });
    });

    context('when there are more than one certification candidate with the given info in the session', function () {
      it('should find two candidates', async function () {
        //given
        const commonCandidateInfo = {
          lastName: candidateData.lastName,
          firstName: candidateData.firstName,
          birthdate: candidateData.birthdate,
          sessionId,
        };

        databaseBuilder.factory.buildOrganizationLearner({ id: 666 });
        databaseBuilder.factory.buildOrganizationLearner({ id: 777 });

        const certificationCandidates1 = databaseBuilder.factory.buildCertificationCandidate({
          ...commonCandidateInfo,
          organizationLearnerId: 777,
        });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: certificationCandidates1.id });
        const certificationCandidates2 = databaseBuilder.factory.buildCertificationCandidate({
          ...commonCandidateInfo,
          organizationLearnerId: 666,
        });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: certificationCandidates2.id });

        await databaseBuilder.commit();

        // when
        const actualCandidates =
          await certificationCandidateRepository.findBySessionIdAndPersonalInfo(commonCandidateInfo);

        // then
        expect(actualCandidates).to.have.lengthOf(2);
        expect(actualCandidates[0].lastName).to.equal(commonCandidateInfo.lastName);
        expect(actualCandidates[1].lastName).to.equal(commonCandidateInfo.lastName);
        expect([actualCandidates[0].organizationLearnerId, actualCandidates[1].organizationLearnerId]).to.have.members([
          certificationCandidates1.organizationLearnerId,
          certificationCandidates2.organizationLearnerId,
        ]);
        expect(actualCandidates[0].id).to.not.equal(actualCandidates[1].id);
      });
    });
  });

  describe('#getBySessionIdAndUserId', function () {
    let userId;
    let complementaryCertificationId;

    beforeEach(function () {
      // given
      userId = databaseBuilder.factory.buildUser().id;
      complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification().id;
      const certificationCandidateId = databaseBuilder.factory.buildCertificationCandidate({ sessionId, userId }).id;
      databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId });
      databaseBuilder.factory.buildComplementaryCertificationSubscription({
        complementaryCertificationId,
        certificationCandidateId,
      });

      return databaseBuilder.commit();
    });

    context('when there is one certification candidate with the given session id and user id', function () {
      it('should fetch the candidate', async function () {
        // when
        const actualCandidates = await certificationCandidateRepository.getBySessionIdAndUserId({ sessionId, userId });

        // then
        expect(actualCandidates.sessionId).to.equal(sessionId);
        expect(actualCandidates.userId).to.equal(userId);
        expect(actualCandidates.complementaryCertification).not.to.be.null;
        expect(actualCandidates.complementaryCertification.id).to.equal(complementaryCertificationId);
      });
    });

    context('when there is no certification candidate with the given session id', function () {
      it('should return undefined', async function () {
        // when
        const result = await certificationCandidateRepository.getBySessionIdAndUserId({
          sessionId: sessionId + 1,
          userId: userId,
        });

        // then
        expect(result).to.be.undefined;
      });
    });

    context('when there is no certification candidate with the given user id', function () {
      it('should return undefined', async function () {
        // when
        const result = await certificationCandidateRepository.getBySessionIdAndUserId({
          sessionId: sessionId,
          userId: userId + 1,
        });

        // then
        expect(result).to.be.undefined;
      });
    });
  });

  describe('#findOneBySessionIdAndUserId', function () {
    let userId;

    beforeEach(function () {
      // given
      userId = databaseBuilder.factory.buildUser().id;
      const candidate = databaseBuilder.factory.buildCertificationCandidate({ sessionId: sessionId, userId: userId });
      databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate.id });
      return databaseBuilder.commit();
    });

    context('when there is one certification candidate with the given session id and user id', function () {
      it('should fetch the candidate', async function () {
        // when
        const actualCandidates = await certificationCandidateRepository.findOneBySessionIdAndUserId({
          sessionId,
          userId,
        });

        // then
        expect(actualCandidates.sessionId).to.equal(sessionId);
        expect(actualCandidates.userId).to.equal(userId);
      });
    });

    context('when there is no certification candidate with the given session id and user id', function () {
      it('should not find any candidate', async function () {
        // when
        const actualCandidates = await certificationCandidateRepository.findOneBySessionIdAndUserId({
          sessionId: sessionId + 1,
          userId: userId + 1,
        });

        // then
        expect(actualCandidates).to.be.undefined;
      });
    });
  });

  describe('#update', function () {
    describe('when certification candidate exists', function () {
      it('should update authorizedToStart certification candidate attribute', async function () {
        // given
        const session = databaseBuilder.factory.buildSession();
        databaseBuilder.factory.buildUser({ id: 1234 });
        const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({
          sessionId: session.id,
          userId: 1234,
          authorizedToStart: true,
          birthdate: '2000-01-04',
          extraTimePercentage: '0.30',
          firstName: 'first-name',
          id: 456,
          lastName: 'last-name',
        });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: certificationCandidate.id });
        await databaseBuilder.commit();

        // when
        await certificationCandidateRepository.update(
          domainBuilder.buildCertificationCandidate({
            id: certificationCandidate.id,
            authorizedToStart: false,
            subscriptions: [domainBuilder.buildCoreSubscription()],
          }),
        );

        // then
        const updatedCertificationCandidate = await knex
          .select('authorizedToStart')
          .from('certification-candidates')
          .where({ id: certificationCandidate.id })
          .first();

        expect(updatedCertificationCandidate.authorizedToStart).to.be.false;
      });
    });

    describe('when certification candidate is not found', function () {
      it('should throw', async function () {
        // given
        const session = databaseBuilder.factory.buildSession({ id: 23049 });
        databaseBuilder.factory.buildUser({ id: 1234 });
        const candidate = databaseBuilder.factory.buildCertificationCandidate({
          sessionId: session.id,
          userId: 1234,
          authorizedToStart: false,
          birthdate: '2000-01-04',
          extraTimePercentage: '0.30',
          firstName: 'first-name',
          id: 456,
          lastName: 'last-name',
        });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate.id });

        await databaseBuilder.commit();
        const wrongCandidateId = 1298;

        // when
        const error = await catchErr(certificationCandidateRepository.update)(
          domainBuilder.buildCertificationCandidate({
            id: wrongCandidateId,
            authorizedToStart: false,
            subscriptions: [domainBuilder.buildCoreSubscription()],
          }),
        );

        // then
        expect(error).to.be.an.instanceOf(NotFoundError);
      });
    });
  });

  describe('#getWithComplementaryCertification', function () {
    context('when certification candidate is not found', function () {
      it('should throw NotFound error', async function () {
        // given
        const candidate = databaseBuilder.factory.buildCertificationCandidate({ id: 1 });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate.id });
        const wrongCandidateId = 99;
        await databaseBuilder.commit();

        // when
        const error = await catchErr(certificationCandidateRepository.getWithComplementaryCertification)({
          id: wrongCandidateId,
        });

        // then
        expect(error).to.be.an.instanceOf(NotFoundError);
      });
    });

    context('when the candidate has no complementary certification subscription', function () {
      it('should return the candidate with empty complementary certification', async function () {
        // given
        const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate();
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: certificationCandidate.id });
        await databaseBuilder.commit();

        // when
        const certificationCandidateWithComplementaryCertifications =
          await certificationCandidateRepository.getWithComplementaryCertification({ id: certificationCandidate.id });

        // then
        expect(certificationCandidateWithComplementaryCertifications).to.deep.equal(
          domainBuilder.buildCertificationCandidate({
            ...certificationCandidate,
            complementaryCertification: null,
            subscriptions: [domainBuilder.buildCoreSubscription()],
          }),
        );
      });
    });

    context('when the candidate has complementary certification subscriptions', function () {
      it('should return the candidate with his complementary certification', async function () {
        // given
        const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate();
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: certificationCandidate.id });
        const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
          label: 'Complementary certification 2',
        });
        databaseBuilder.factory.buildComplementaryCertificationSubscription({
          complementaryCertificationId: complementaryCertification.id,
          certificationCandidateId: certificationCandidate.id,
        });
        await databaseBuilder.commit();

        // when
        const certificationCandidateWithComplementaryCertification =
          await certificationCandidateRepository.getWithComplementaryCertification({ id: certificationCandidate.id });

        // then
        expect(certificationCandidateWithComplementaryCertification).to.deep.equal(
          domainBuilder.buildCertificationCandidate({
            ...certificationCandidate,
            subscriptions: [domainBuilder.buildCoreSubscription()],
            complementaryCertification:
              domainBuilder.certification.sessionManagement.buildCertificationSessionComplementaryCertification(
                complementaryCertification,
              ),
          }),
        );
      });
    });
  });

  describe('#findCompanionPingInfoByUserId', function () {
    const userId = 99;

    beforeEach(async function () {
      databaseBuilder.factory.buildUser({ id: userId });

      await databaseBuilder.commit();
    });

    context('when the user has certification courses', function () {
      beforeEach(async function () {
        // completed session
        const completedSessionId = 66;
        databaseBuilder.factory.buildSession({ id: completedSessionId });
        databaseBuilder.factory.buildCertificationCandidate({ id: 66, userId, sessionId: completedSessionId });
        databaseBuilder.factory.buildCertificationCourse({
          id: 66,
          userId,
          sessionId: completedSessionId,
          createdAt: new Date('2024-07-06'),
          endedAt: null,
          completedAt: new Date('2024-07-06'),
        });

        // ended session
        const endedSessionId = 77;
        databaseBuilder.factory.buildSession({ id: endedSessionId });
        databaseBuilder.factory.buildCertificationCandidate({ id: 77, userId, sessionId: endedSessionId });
        databaseBuilder.factory.buildCertificationCourse({
          id: 77,
          userId,
          sessionId: endedSessionId,
          createdAt: new Date('2024-07-08'),
          endedAt: new Date('2024-07-08'),
          completedAt: null,
        });

        // never completed session
        const neverCompletedOrEndedSessionId = 88;
        databaseBuilder.factory.buildSession({ id: neverCompletedOrEndedSessionId });
        databaseBuilder.factory.buildCertificationCandidate({
          id: 88,
          userId,
          sessionId: neverCompletedOrEndedSessionId,
        });
        databaseBuilder.factory.buildCertificationCourse({
          id: 88,
          userId,
          sessionId: neverCompletedOrEndedSessionId,
          createdAt: new Date('2024-07-10'),
          endedAt: null,
          completedAt: null,
        });

        await databaseBuilder.commit();
      });

      const sessionId = 99;
      const certificationCandidateId = 999;

      context('when last certification course is ended', function () {
        it('should throw a NotFoundError', async function () {
          // given
          databaseBuilder.factory.buildSession({ id: sessionId });
          databaseBuilder.factory.buildCertificationCandidate({ id: certificationCandidateId, userId, sessionId });
          databaseBuilder.factory.buildCertificationCourse({
            id: 99,
            userId,
            sessionId,
            createdAt: new Date('2024-07-12'),
            endedAt: new Date('2024-07-12'),
            completedAt: null,
          });
          await databaseBuilder.commit();

          // when
          const error = await catchErr(certificationCandidateRepository.findCompanionPingInfoByUserId)({
            userId,
          });

          // then
          expect(error).to.be.instanceOf(NotFoundError);
          expect(error.message).to.equal(`User ${userId} is not in a certification’s session`);
        });
      });

      context('when last certification course is completed', function () {
        it('should throw a NotFoundError', async function () {
          // given
          databaseBuilder.factory.buildSession({ id: sessionId });
          databaseBuilder.factory.buildCertificationCandidate({ id: certificationCandidateId, userId, sessionId });
          databaseBuilder.factory.buildCertificationCourse({
            id: 99,
            userId,
            sessionId,
            createdAt: new Date('2024-07-12'),
            endedAt: null,
            completedAt: new Date('2024-07-12'),
          });
          await databaseBuilder.commit();

          // when
          const error = await catchErr(certificationCandidateRepository.findCompanionPingInfoByUserId)({
            userId,
          });

          // then
          expect(error).to.be.instanceOf(NotFoundError);
          expect(error.message).to.equal(`User ${userId} is not in a certification’s session`);
        });
      });

      context('when last certification course is neither ended nor completed', function () {
        it('should return companion ping info', async function () {
          // given
          databaseBuilder.factory.buildSession({ id: sessionId });
          databaseBuilder.factory.buildCertificationCandidate({ id: certificationCandidateId, userId, sessionId });
          databaseBuilder.factory.buildCertificationCourse({
            id: 99,
            userId,
            sessionId,
            createdAt: new Date('2024-07-12'),
            endedAt: null,
            completedAt: null,
          });
          await databaseBuilder.commit();

          // when
          const companionPingInfo = await certificationCandidateRepository.findCompanionPingInfoByUserId({
            userId,
          });

          // then
          expect(companionPingInfo).deepEqualInstance(new CompanionPingInfo({ sessionId, certificationCandidateId }));
        });
      });
    });

    context('where the user isn’t currently in a session', function () {
      it('should throw a NotFoundError', async function () {
        // given
        databaseBuilder.factory.buildCertificationCandidate({ id: 66, userId, sessionId: 666 });

        // when
        const error = await catchErr(certificationCandidateRepository.findCompanionPingInfoByUserId)({
          userId,
        });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.equal(`User ${userId} is not in a certification’s session`);
      });
    });
  });
});
