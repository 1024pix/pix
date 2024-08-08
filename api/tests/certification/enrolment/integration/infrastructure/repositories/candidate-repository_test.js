import { CertificationCandidateNotFoundError } from '../../../../../../src/certification/enrolment/domain/errors.js';
import { Candidate } from '../../../../../../src/certification/enrolment/domain/models/Candidate.js';
import * as candidateRepository from '../../../../../../src/certification/enrolment/infrastructure/repositories/candidate-repository.js';
import { SUBSCRIPTION_TYPES } from '../../../../../../src/certification/shared/domain/constants.js';
import { catchErr, databaseBuilder, domainBuilder, expect, knex } from '../../../../../test-helper.js';

describe('Integration | Certification | Session | Repository | Candidate', function () {
  describe('#get', function () {
    context('when the candidate exists', function () {
      it('should return the candidate', async function () {
        // given
        databaseBuilder.factory.buildComplementaryCertification({
          id: 1,
          key: 'comp1',
        });
        const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate();
        databaseBuilder.factory.buildCoreSubscription({
          certificationCandidateId: certificationCandidate.id,
        });
        databaseBuilder.factory.buildComplementaryCertificationSubscription({
          certificationCandidateId: certificationCandidate.id,
          complementaryCertificationId: 1,
        });
        await databaseBuilder.commit();

        // when
        const result = await candidateRepository.get({ certificationCandidateId: certificationCandidate.id });

        // then
        expect(result).to.deepEqualInstance(
          new Candidate({
            ...certificationCandidate,
            subscriptions: [
              domainBuilder.buildComplementarySubscription({
                certificationCandidateId: certificationCandidate.id,
                complementaryCertificationId: 1,
              }),
              domainBuilder.buildCoreSubscription({ certificationCandidateId: certificationCandidate.id }),
            ],
          }),
        );
      });
    });

    context('when the candidate does not exist', function () {
      it('return null', async function () {
        // given
        const wrongCertificationCandidateId = 4568;

        //when
        const result = await candidateRepository.get({ certificationCandidateId: wrongCertificationCandidateId });

        // then
        expect(result).to.be.null;
      });
    });
  });

  describe('#update', function () {
    describe('when the candidate exists', function () {
      it('should update the candidate', async function () {
        // when
        const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({
          firstName: 'toto',
        });

        await databaseBuilder.commit();

        const certificationCandidateToUpdate = domainBuilder.certification.enrolment.buildCertificationSessionCandidate(
          {
            ...certificationCandidate,
          },
        );

        certificationCandidateToUpdate.firstName = 'tutu';

        const updatedCertificationCandidate = await candidateRepository.update(certificationCandidateToUpdate);

        // then
        expect(updatedCertificationCandidate).to.be.instanceOf(Candidate);
        expect(updatedCertificationCandidate.firstName).to.equal('tutu');
      });
    });

    describe('when the candidate does not exist', function () {
      it('should throw', async function () {
        // when
        const certificationCandidateToUpdate = domainBuilder.certification.enrolment.buildCertificationSessionCandidate(
          { firstName: 'candidate unknown' },
        );

        certificationCandidateToUpdate.firstName = 'tutu';

        const error = await catchErr(candidateRepository.update)(certificationCandidateToUpdate);

        // then
        expect(error).to.be.instanceOf(CertificationCandidateNotFoundError);
      });
    });
  });

  describe('#isUserCertificationCandidate', function () {
    describe('when the candidate exists and is reconciled to a given user', function () {
      it('should return true', async function () {
        // when
        const userId = databaseBuilder.factory.buildUser().id;
        const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({
          userId,
        });

        await databaseBuilder.commit();

        const isUserCertificationCandidate = await candidateRepository.isUserCertificationCandidate({
          userId,
          certificationCandidateId: certificationCandidate.id,
        });

        // then
        expect(isUserCertificationCandidate).to.be.true;
      });
    });

    describe('when the candidate is not reconciled to the given user', function () {
      it('should return false', async function () {
        // when
        const userId = databaseBuilder.factory.buildUser().id;
        const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({
          userId: null,
        });

        await databaseBuilder.commit();

        const isUserCertificationCandidate = await candidateRepository.isUserCertificationCandidate({
          userId,
          certificationCandidateId: certificationCandidate.id,
        });

        // then
        expect(isUserCertificationCandidate).to.be.false;
      });
    });
  });

  describe('#insert', function () {
    let candidateData;

    beforeEach(function () {
      candidateData = {
        id: null,
        createdAt: new Date('2020-01-01'),
        firstName: 'Jean-Charles',
        lastName: 'Quiberon',
        sex: 'M',
        birthPostalCode: 'Code postal',
        birthINSEECode: 'Insee code',
        birthCity: 'Ma ville',
        birthProvinceCode: 'Mon département',
        birthCountry: 'Mon pays',
        email: 'jc.quiberon@example.net',
        resultRecipientEmail: 'ma_maman@example.net',
        birthdate: '1990-05-06',
        extraTimePercentage: 0.3,
        externalId: 'JCQUIB',
        userId: null,
        sessionId: 888,
        organizationLearnerId: null,
        authorizedToStart: false,
        complementaryCertificationId: null,
        billingMode: null,
        prepaymentCode: null,
        hasSeenCertificationInstructions: false,
        accessibilityAdjustmentNeeded: false,
        subscriptions: [
          {
            type: SUBSCRIPTION_TYPES.CORE,
            complementaryCertificationId: null,
            complementaryCertificationLabel: null,
            complementaryCertificationKey: null,
          },
          {
            type: SUBSCRIPTION_TYPES.COMPLEMENTARY,
            complementaryCertificationId: 22,
            complementaryCertificationLabel: 'Quelque',
            complementaryCertificationKey: 'Chose',
          },
        ],
      };
      databaseBuilder.factory.buildSession({ id: candidateData.sessionId });
      databaseBuilder.factory.buildComplementaryCertification({ id: 22, label: 'Quelque', key: 'Chose' });
      return databaseBuilder.commit();
    });

    it('should insert candidate in DB with subscriptions', async function () {
      // given
      const candidateToInsert = domainBuilder.certification.enrolment.buildCandidate(candidateData);

      // when
      const candidateId = await candidateRepository.insert(candidateToInsert);

      // then
      const savedCandidateData = await knex('certification-candidates').select('*').where({ id: candidateId }).first();
      const savedSubscriptionsData = await knex('certification-subscriptions')
        .select('*')
        .where({ certificationCandidateId: candidateId })
        .orderBy('type');
      expect(savedCandidateData).to.deepEqualInstanceOmitting(candidateData, [
        'id',
        'createdAt',
        'subscriptions',
        'complementaryCertificationId',
        'extraTimePercentage',
      ]);
      expect(parseFloat(savedCandidateData.extraTimePercentage)).to.equal(candidateData.extraTimePercentage);
      expect(savedSubscriptionsData.length).to.equal(2);
      expect(savedSubscriptionsData[0]).to.deepEqualInstanceOmitting(
        {
          certificationCandidateId: candidateId,
          type: SUBSCRIPTION_TYPES.COMPLEMENTARY,
          complementaryCertificationId: 22,
        },
        ['createdAt'],
      );
      expect(savedSubscriptionsData[1]).to.deepEqualInstanceOmitting(
        {
          certificationCandidateId: candidateId,
          type: SUBSCRIPTION_TYPES.CORE,
          complementaryCertificationId: null,
        },
        ['createdAt'],
      );
    });
  });
});
