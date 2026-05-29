import { Candidate } from '../../../../../../src/certification/enrolment/domain/models/Candidate.js';
import * as candidateRepository from '../../../../../../src/certification/enrolment/infrastructure/repositories/candidate-repository.js';
import { SUBSCRIPTION_TYPES } from '../../../../../../src/certification/shared/domain/constants.js';
import { CertificationCandidateNotFoundError } from '../../../../../../src/certification/shared/domain/errors.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { _ } from '../../../../../../src/shared/infrastructure/utils/lodash-utils.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Integration | Certification | Enrolment | Repository | Candidate', function () {
  describe('#get', function () {
    context('when the candidate exists', function () {
      it('should return the candidate', async function () {
        // given
        const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate();

        databaseBuilder.factory.buildCoreSubscription({
          certificationCandidateId: certificationCandidate.id,
        });

        const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
          id: 1,
          key: Frameworks.CLEA,
        });

        databaseBuilder.factory.buildComplementaryCertificationSubscription({
          certificationCandidateId: certificationCandidate.id,
          complementaryCertificationId: complementaryCertification.id,
        });

        await databaseBuilder.commit();

        // when
        const result = await candidateRepository.get({ certificationCandidateId: certificationCandidate.id });

        // then
        expect(result).to.deepEqualInstance(
          new Candidate({
            ...certificationCandidate,
            subscriptions: [
              domainBuilder.certification.enrolment.buildComplementarySubscription({
                certificationCandidateId: certificationCandidate.id,
                complementaryCertificationKey: complementaryCertification.key,
              }),
              domainBuilder.certification.enrolment.buildCoreSubscription({
                certificationCandidateId: certificationCandidate.id,
              }),
            ],
          }),
        );
      });
    });

    context('when the candidate has an associated certification course', function () {
      it('should return the candidate with information on whether he/she started the test', async function () {
        // given
        const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate();

        databaseBuilder.factory.buildCoreSubscription({
          certificationCandidateId: certificationCandidate.id,
        });

        databaseBuilder.factory.buildCertificationCourse({
          userId: certificationCandidate.userId,
          candidateId: certificationCandidate.id,
        });

        await databaseBuilder.commit();

        // when
        const result = await candidateRepository.get({
          certificationCandidateId: certificationCandidate.id,
        });

        // then
        expect(result).to.deepEqualInstance(
          new Candidate({
            ...certificationCandidate,
            subscriptions: [
              domainBuilder.certification.enrolment.buildCoreSubscription({
                certificationCandidateId: certificationCandidate.id,
              }),
            ],
            hasStartedTest: true,
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

  describe('#findBySessionId', function () {
    context('when there are candidates', function () {
      it('should return the candidates', async function () {
        // given
        const sessionId = databaseBuilder.factory.buildSession().id;
        databaseBuilder.factory.buildComplementaryCertification({
          id: 1,
          key: Frameworks.CLEA,
        });
        const certificationCandidate1 = databaseBuilder.factory.buildCertificationCandidate({
          sessionId,
        });
        const certificationCandidate2 = databaseBuilder.factory.buildCertificationCandidate({
          firstName: 'FiFouLaPraline',
          sessionId,
        });
        databaseBuilder.factory.buildCertificationCandidate();
        databaseBuilder.factory.buildCoreSubscription({
          certificationCandidateId: certificationCandidate1.id,
        });
        databaseBuilder.factory.buildComplementaryCertificationSubscription({
          certificationCandidateId: certificationCandidate1.id,
          complementaryCertificationId: 1,
        });
        databaseBuilder.factory.buildCoreSubscription({
          certificationCandidateId: certificationCandidate2.id,
        });
        await databaseBuilder.commit();

        // when
        const result = await candidateRepository.findBySessionId({ sessionId });

        // then
        expect(result).to.deepEqualArray([
          domainBuilder.certification.enrolment.buildCandidate({
            ...certificationCandidate1,
            subscriptions: [
              domainBuilder.certification.enrolment.buildComplementarySubscription({
                certificationCandidateId: certificationCandidate1.id,
                complementaryCertificationKey: Frameworks.CLEA,
              }),
              domainBuilder.certification.enrolment.buildCoreSubscription({
                certificationCandidateId: certificationCandidate1.id,
              }),
            ],
          }),
          domainBuilder.certification.enrolment.buildCandidate({
            ...certificationCandidate2,
            subscriptions: [
              domainBuilder.certification.enrolment.buildCoreSubscription({
                certificationCandidateId: certificationCandidate2.id,
              }),
            ],
          }),
        ]);
      });
    });

    context('when there are no candidate', function () {
      it('returns empty array', async function () {
        // given
        const sessionId = databaseBuilder.factory.buildSession().id;
        const otherSessionId = databaseBuilder.factory.buildSession().id;
        const candidateId = databaseBuilder.factory.buildCertificationCandidate({ sessionId }).id;
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidateId });
        await databaseBuilder.commit();

        //when
        const result = await candidateRepository.findBySessionId({ sessionId: otherSessionId });

        // then
        expect(result).to.be.empty;
      });
    });
  });

  describe('#findByUserId', function () {
    context('when there are candidates', function () {
      it('should return the candidates', async function () {
        // given
        const candidate1 = databaseBuilder.factory.buildCertificationCandidate();
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate1.id });
        const userId = candidate1.userId;

        const candidate2 = databaseBuilder.factory.buildCertificationCandidate({ userId });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate2.id });

        const candidate3 = databaseBuilder.factory.buildCertificationCandidate();
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate3.id });
        await databaseBuilder.commit();

        // when
        const result = await candidateRepository.findByUserId({ userId });

        // then
        expect(result).to.deepEqualArray([
          domainBuilder.certification.enrolment.buildCandidate({
            ...candidate1,
            subscriptions: [
              domainBuilder.certification.enrolment.buildCoreSubscription({ certificationCandidateId: candidate1.id }),
            ],
          }),
          domainBuilder.certification.enrolment.buildCandidate({
            ...candidate2,
            subscriptions: [
              domainBuilder.certification.enrolment.buildCoreSubscription({ certificationCandidateId: candidate2.id }),
            ],
          }),
        ]);
      });
    });

    context('when there are no candidates', function () {
      it('returns an empty array', async function () {
        //when
        const result = await candidateRepository.findByUserId({ userId: 123 });

        // then
        expect(result).to.be.empty;
      });
    });
  });

  describe('#update', function () {
    context('when the candidate exists', function () {
      it('should update the candidate', async function () {
        // when
        const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({
          firstName: 'toto',
        });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: certificationCandidate.id });
        await databaseBuilder.commit();
        const certificationCandidateToUpdate = domainBuilder.certification.enrolment.buildCandidate({
          ...certificationCandidate,
          subscriptions: [
            domainBuilder.certification.enrolment.buildCoreSubscription({
              certificationCandidateId: certificationCandidate.id,
            }),
          ],
        });
        certificationCandidateToUpdate.firstName = 'tutu';

        // when
        await candidateRepository.update(certificationCandidateToUpdate);
        const candidate = await candidateRepository.get({
          certificationCandidateId: certificationCandidate.id,
        });

        // then
        expect(candidate).to.be.instanceOf(Candidate);
        expect(candidate.firstName).to.equal('tutu');
      });

      it('should update its subscription', async function () {
        // given
        const droitCertification = databaseBuilder.factory.buildComplementaryCertification({ key: Frameworks.DROIT });
        databaseBuilder.factory.buildComplementaryCertification({ key: Frameworks.EDU_1ER_DEGRE });
        const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({
          subscription: Frameworks.DROIT,
        });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: certificationCandidate.id });
        databaseBuilder.factory.buildComplementaryCertificationSubscription({
          certificationCandidateId: certificationCandidate.id,
          complementaryCertificationId: droitCertification.id,
        });
        await databaseBuilder.commit();

        const candidateToUpdate = domainBuilder.certification.enrolment.buildCandidate({
          ...certificationCandidate,
          subscription: Frameworks.EDU_1ER_DEGRE,
        });

        // when
        await candidateRepository.update(candidateToUpdate);

        // then
        const updated = await candidateRepository.get({ certificationCandidateId: certificationCandidate.id });
        expect(updated.subscription).to.equal(Frameworks.EDU_1ER_DEGRE);
      });
    });

    context('when the candidate does not exist', function () {
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
        reconciledAt: null,
        subscription: Frameworks.DROIT,
      };
      databaseBuilder.factory.buildSession({ id: candidateData.sessionId });
      databaseBuilder.factory.buildComplementaryCertification({ key: Frameworks.DROIT });
      return databaseBuilder.commit();
    });

    it('should insert candidate in DB with subscription', async function () {
      // given
      const candidateToInsert = domainBuilder.certification.enrolment.buildCandidate(candidateData);

      // when
      const candidateId = await candidateRepository.insert(candidateToInsert);

      // then
      const savedCandidateData = await knex('certification-candidates').select('*').where({ id: candidateId }).first();
      expect(savedCandidateData.subscription).to.equal(Frameworks.DROIT);
      expect(parseFloat(savedCandidateData.extraTimePercentage)).to.equal(candidateData.extraTimePercentage);

      const savedSubscriptionsData = await knex('certification-subscriptions')
        .select('*')
        .where({ certificationCandidateId: candidateId })
        .orderBy('type');
      expect(savedSubscriptionsData).to.have.lengthOf(1);
      expect(savedSubscriptionsData[0]).to.deepEqualInstanceOmitting(
        { certificationCandidateId: candidateId, type: SUBSCRIPTION_TYPES.COMPLEMENTARY },
        ['createdAt', 'complementaryCertificationId'],
      );
    });
  });

  describe('#save', function () {
    it("should insert session's candidates in DB with their subscriptions", async function () {
      // given
      const cleaCertificationId = databaseBuilder.factory.buildComplementaryCertification.clea({}).id;
      const droitCertificationId = databaseBuilder.factory.buildComplementaryCertification.droit({}).id;
      const sessionId = databaseBuilder.factory.buildSession({}).id;
      await databaseBuilder.commit();
      const candidateA = domainBuilder.certification.enrolment.buildCandidate({
        firstName: 'Lolo',
        lastName: 'Lapraline',
        accessibilityAdjustmentNeeded: true,
        sessionId,
        subscriptions: [
          domainBuilder.certification.enrolment.buildCoreSubscription(),
          domainBuilder.certification.enrolment.buildComplementarySubscription({
            complementaryCertificationKey: Frameworks.CLEA,
          }),
        ],
        subscription: Frameworks.CLEA,
      });
      const candidateB = domainBuilder.certification.enrolment.buildCandidate({
        firstName: 'Geogeo',
        lastName: 'Lenougat',
        accessibilityAdjustmentNeeded: true,
        sessionId,
        subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
      });
      const candidateC = domainBuilder.certification.enrolment.buildCandidate({
        firstName: 'Loulou',
        lastName: 'Lapistache',
        sessionId,
        accessibilityAdjustmentNeeded: false,
        subscriptions: [
          domainBuilder.certification.enrolment.buildComplementarySubscription({
            complementaryCertificationKey: Frameworks.DROIT,
          }),
        ],
        subscription: Frameworks.DROIT,
      });

      // when
      await candidateRepository.save({ candidates: [candidateA, candidateB, candidateC] });

      // then
      // Candidate A
      const savedCandidateAData = await knex('certification-candidates')
        .select('*')
        .where({ firstName: 'Lolo' })
        .first();
      const savedSubscriptionsAData = await knex('certification-subscriptions')
        .select('*')
        .where({ certificationCandidateId: savedCandidateAData.id })
        .orderBy('type');
      expect(_.omit(savedCandidateAData, ['createdAt', 'extraTimePercentage'])).to.deep.equal({
        id: savedCandidateAData.id,
        firstName: candidateA.firstName,
        reconciledAt: null,
        lastName: candidateA.lastName,
        birthCity: candidateA.birthCity,
        externalId: candidateA.externalId,
        birthdate: candidateA.birthdate,
        sessionId: sessionId,
        birthProvinceCode: candidateA.birthProvinceCode,
        birthCountry: candidateA.birthCountry,
        userId: null,
        email: candidateA.email,
        resultRecipientEmail: candidateA.resultRecipientEmail,
        organizationLearnerId: candidateA.organizationLearnerId,
        birthPostalCode: candidateA.birthPostalCode,
        birthINSEECode: candidateA.birthINSEECode,
        sex: candidateA.sex,
        authorizedToStart: false,
        billingMode: candidateA.billingMode,
        prepaymentCode: candidateA.prepaymentCode,
        hasSeenCertificationInstructions: false,
        accessibilityAdjustmentNeeded: candidateA.accessibilityAdjustmentNeeded,
        subscription: Frameworks.CLEA,
      });
      expect(savedCandidateAData.createdAt).to.be.instanceOf(Date);
      expect(parseFloat(savedCandidateAData.extraTimePercentage)).to.equal(candidateA.extraTimePercentage);
      expect(savedSubscriptionsAData).to.have.lengthOf(2);
      expect(savedSubscriptionsAData[0]).to.deepEqualInstanceOmitting(
        {
          certificationCandidateId: savedCandidateAData.id,
          type: SUBSCRIPTION_TYPES.COMPLEMENTARY,
          complementaryCertificationId: cleaCertificationId,
        },
        ['createdAt'],
      );
      expect(savedSubscriptionsAData[1]).to.deepEqualInstanceOmitting(
        {
          certificationCandidateId: savedCandidateAData.id,
          type: SUBSCRIPTION_TYPES.CORE,
          complementaryCertificationId: null,
        },
        ['createdAt'],
      );

      // Candidate B
      const savedCandidateBData = await knex('certification-candidates')
        .select('*')
        .where({ firstName: 'Geogeo' })
        .first();
      const savedSubscriptionsBData = await knex('certification-subscriptions')
        .select('*')
        .where({ certificationCandidateId: savedCandidateBData.id })
        .orderBy('type');
      expect(_.omit(savedCandidateBData, ['createdAt', 'extraTimePercentage'])).to.deep.equal({
        id: savedCandidateBData.id,
        firstName: candidateB.firstName,
        reconciledAt: null,
        lastName: candidateB.lastName,
        birthCity: candidateB.birthCity,
        externalId: candidateB.externalId,
        birthdate: candidateB.birthdate,
        sessionId: sessionId,
        birthProvinceCode: candidateB.birthProvinceCode,
        birthCountry: candidateB.birthCountry,
        userId: null,
        email: candidateB.email,
        resultRecipientEmail: candidateB.resultRecipientEmail,
        organizationLearnerId: candidateB.organizationLearnerId,
        birthPostalCode: candidateB.birthPostalCode,
        birthINSEECode: candidateB.birthINSEECode,
        sex: candidateB.sex,
        authorizedToStart: false,
        billingMode: candidateB.billingMode,
        prepaymentCode: candidateB.prepaymentCode,
        hasSeenCertificationInstructions: false,
        accessibilityAdjustmentNeeded: candidateB.accessibilityAdjustmentNeeded,
        subscription: Frameworks.CORE,
      });
      expect(savedCandidateBData.createdAt).to.be.instanceOf(Date);
      expect(parseFloat(savedCandidateBData.extraTimePercentage)).to.equal(candidateB.extraTimePercentage);
      expect(savedSubscriptionsBData).to.have.lengthOf(1);
      expect(savedSubscriptionsBData[0]).to.deepEqualInstanceOmitting(
        {
          certificationCandidateId: savedCandidateBData.id,
          type: SUBSCRIPTION_TYPES.CORE,
          complementaryCertificationId: null,
        },
        ['createdAt'],
      );

      // Candidate C
      const savedCandidateCData = await knex('certification-candidates')
        .select('*')
        .where({ firstName: 'Loulou' })
        .first();
      const savedSubscriptionsCData = await knex('certification-subscriptions')
        .select('*')
        .where({ certificationCandidateId: savedCandidateCData.id })
        .orderBy('type');
      expect(_.omit(savedCandidateCData, ['createdAt', 'extraTimePercentage'])).to.deep.equal({
        id: savedCandidateCData.id,
        firstName: candidateC.firstName,
        reconciledAt: null,
        lastName: candidateC.lastName,
        birthCity: candidateC.birthCity,
        externalId: candidateC.externalId,
        birthdate: candidateC.birthdate,
        sessionId: sessionId,
        birthProvinceCode: candidateC.birthProvinceCode,
        birthCountry: candidateC.birthCountry,
        userId: null,
        email: candidateC.email,
        resultRecipientEmail: candidateC.resultRecipientEmail,
        organizationLearnerId: candidateC.organizationLearnerId,
        birthPostalCode: candidateC.birthPostalCode,
        birthINSEECode: candidateC.birthINSEECode,
        sex: candidateC.sex,
        authorizedToStart: false,
        billingMode: candidateC.billingMode,
        prepaymentCode: candidateC.prepaymentCode,
        hasSeenCertificationInstructions: false,
        accessibilityAdjustmentNeeded: candidateC.accessibilityAdjustmentNeeded,
        subscription: Frameworks.DROIT,
      });
      expect(savedCandidateCData.createdAt).to.be.instanceOf(Date);
      expect(parseFloat(savedCandidateCData.extraTimePercentage)).to.equal(candidateC.extraTimePercentage);
      expect(savedSubscriptionsCData).to.have.lengthOf(1);
      expect(savedSubscriptionsCData[0]).to.deepEqualInstanceOmitting(
        {
          certificationCandidateId: savedCandidateCData.id,
          type: SUBSCRIPTION_TYPES.COMPLEMENTARY,
          complementaryCertificationId: droitCertificationId,
        },
        ['createdAt'],
      );
    });
  });
});
