import _ from 'lodash';

import * as certificationCandidateRepository from '../../../../../../src/certification/enrolment/infrastructure/repositories/certification-candidate-repository.js';
import { ComplementaryCertification } from '../../../../../../src/certification/session-management/domain/models/ComplementaryCertification.js';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, databaseBuilder, domainBuilder, expect, knex } from '../../../../../test-helper.js';

describe('Integration | Repository | CertificationCandidate', function () {
  let sessionId;

  beforeEach(async function () {
    sessionId = databaseBuilder.factory.buildSession().id;

    await databaseBuilder.commit();
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

  describe('#getBySessionIdAndUserId', function () {
    let userId;
    let complementaryCertificationId;
    let certificationCandidateId;
    let createdAt, reconciledAt;

    beforeEach(function () {
      // given
      createdAt = new Date('2000-01-01');
      reconciledAt = new Date('2020-01-02');
      userId = databaseBuilder.factory.buildUser().id;
      complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification().id;
      certificationCandidateId = databaseBuilder.factory.buildCertificationCandidate({
        sessionId,
        userId,
        createdAt,
        reconciledAt,
      }).id;
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
        const actualCandidate = await certificationCandidateRepository.getBySessionIdAndUserId({ sessionId, userId });

        // then
        expect(actualCandidate).to.deep.equal({
          accessibilityAdjustmentNeeded: false,
          authorizedToStart: false,
          billingMode: null,
          birthCity: 'PARIS 1',
          birthCountry: 'France',
          birthINSEECode: '75101',
          birthPostalCode: null,
          birthProvinceCode: null,
          birthdate: '2000-01-04',
          complementaryCertification: {
            id: complementaryCertificationId,
            key: 'DROIT',
            label: 'UneSuperCertifComplémentaire',
          },
          createdAt,
          email: 'somemail@example.net',
          externalId: 'externalId',
          extraTimePercentage: 0.3,
          firstName: 'first-name',
          hasSeenCertificationInstructions: false,
          id: certificationCandidateId,
          lastName: 'last-name',
          organizationLearnerId: null,
          prepaymentCode: null,
          reconciledAt,
          resultRecipientEmail: 'somerecipientmail@example.net',
          sessionId,
          sex: 'M',
          subscriptions: [
            {
              certificationCandidateId: undefined,
              complementaryCertificationId: null,
              type: 'CORE',
            },
            {
              certificationCandidateId,
              complementaryCertificationId,
              type: 'COMPLEMENTARY',
            },
          ],
          userId: userId,
        });
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
});
