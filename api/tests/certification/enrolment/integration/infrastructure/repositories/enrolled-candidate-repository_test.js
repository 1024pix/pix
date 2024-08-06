import * as enrolledCandidateRepository from '../../../../../../src/certification/enrolment/infrastructure/repositories/enrolled-candidate-repository.js';
import { SUBSCRIPTION_TYPES } from '../../../../../../src/certification/shared/domain/constants.js';
import { CertificationCandidate } from '../../../../../../src/shared/domain/models/index.js';
import { databaseBuilder, domainBuilder, expect } from '../../../../../test-helper.js';

describe('Certification | Enrolment | Integration | Repository | EnrolledCandidate', function () {
  describe('#findBySessionId', function () {
    let michelData, jeannetteData, fredericData;
    let sessionId, anotherSessionId;

    beforeEach(function () {
      sessionId = databaseBuilder.factory.buildSession().id;
      anotherSessionId = databaseBuilder.factory.buildSession().id;
      michelData = {
        id: 1,
        createdAt: new Date('2020-01-01'),
        firstName: 'Michel',
        lastName: 'Jacques',
        sex: 'M',
        birthPostalCode: 'somePostalCode1',
        birthINSEECode: 'someInseeCode1',
        birthCity: 'someBirthCity1',
        birthProvinceCode: 'someProvinceCode1',
        birthCountry: 'someBirthCountry1',
        email: 'michel.jacques@example.net',
        resultRecipientEmail: 'jeanette.jacques@example.net',
        externalId: 'MICHELJACQUES',
        birthdate: '1990-01-01',
        extraTimePercentage: null,
        userId: null,
        organizationLearnerId: null,
        billingMode: CertificationCandidate.BILLING_MODES.PREPAID,
        prepaymentCode: 'somePrepaymentCode1',
        sessionId,
      };
      jeannetteData = {
        id: 2,
        createdAt: new Date('2021-01-01'),
        firstName: 'Jeanette',
        lastName: 'Jacques',
        sex: 'F',
        birthPostalCode: 'somePostalCode2',
        birthINSEECode: 'someInseeCode2',
        birthCity: 'someBirthCity2',
        birthProvinceCode: 'someProvinceCode2',
        birthCountry: 'someBirthCountry2',
        email: 'jeanette.jacques@example.net',
        resultRecipientEmail: 'michel.jacques@example.net',
        externalId: 'JEANETTEJACQUES',
        birthdate: '1990-01-02',
        extraTimePercentage: 0.5,
        userId: null,
        organizationLearnerId: null,
        billingMode: CertificationCandidate.BILLING_MODES.PREPAID,
        prepaymentCode: 'somePrepaymentCode2',
        sessionId,
      };
      fredericData = {
        id: 3,
        createdAt: new Date('2022-01-01'),
        firstName: 'Frédéric',
        lastName: 'Mercure',
        sex: 'M',
        birthPostalCode: 'somePostalCode3',
        birthINSEECode: 'someInseeCode3',
        birthCity: 'someBirthCity3',
        birthProvinceCode: 'someProvinceCode3',
        birthCountry: 'someBirthCountry3',
        email: 'fred.mercure@example.net',
        resultRecipientEmail: 'my.mom@example.net',
        externalId: 'MORDSLAPOUSSIERE',
        birthdate: '1990-01-03',
        extraTimePercentage: null,
        userId: null,
        organizationLearnerId: null,
        billingMode: CertificationCandidate.BILLING_MODES.FREE,
        prepaymentCode: 'somePrepaymentCode3',
        sessionId,
      };
      databaseBuilder.factory.buildCertificationCandidate(michelData);
      databaseBuilder.factory.buildCertificationCandidate(jeannetteData);
      databaseBuilder.factory.buildCertificationCandidate(fredericData);
      // some candidates not in session
      databaseBuilder.factory.buildCertificationCandidate({
        lastName: 'Ouistiti',
        firstName: 'Paul',
        sessionId: anotherSessionId,
      });
      databaseBuilder.factory.buildCertificationCandidate({
        lastName: 'Ouistiti',
        firstName: 'James',
        sessionId: anotherSessionId,
      });
      databaseBuilder.factory.buildCoreSubscription({
        certificationCandidateId: michelData.id,
        complementaryCertificationId: null,
      });
      databaseBuilder.factory.buildCoreSubscription({
        certificationCandidateId: jeannetteData.id,
        complementaryCertificationId: null,
      });
      return databaseBuilder.commit();
    });

    it('should return an empty array when no candidates found for given session', async function () {
      // when
      const actualEnrolledCandidates = await enrolledCandidateRepository.findBySessionId({ sessionId: 99999999 });

      // then
      expect(actualEnrolledCandidates).to.deepEqualArray([]);
    });

    it('should fetch, alphabetically sorted, the enrolled candidates with a specific session ID', async function () {
      // given
      databaseBuilder.factory.buildCoreSubscription({
        certificationCandidateId: fredericData.id,
        complementaryCertificationId: null,
      });
      await databaseBuilder.commit();

      // when
      const actualEnrolledCandidates = await enrolledCandidateRepository.findBySessionId({ sessionId });

      // then
      expect(actualEnrolledCandidates).to.deepEqualArray([
        domainBuilder.certification.enrolment.buildEnrolledCandidate({
          ...jeannetteData,
          subscriptions: [
            {
              type: SUBSCRIPTION_TYPES.CORE,
              certificationCandidateId: jeannetteData.id,
              complementaryCertificationId: null,
            },
          ],
        }),
        domainBuilder.certification.enrolment.buildEnrolledCandidate({
          ...michelData,
          subscriptions: [
            {
              type: SUBSCRIPTION_TYPES.CORE,
              certificationCandidateId: michelData.id,
              complementaryCertificationId: null,
            },
          ],
        }),
        domainBuilder.certification.enrolment.buildEnrolledCandidate({
          ...fredericData,
          subscriptions: [
            {
              type: SUBSCRIPTION_TYPES.CORE,
              certificationCandidateId: fredericData.id,
              complementaryCertificationId: null,
            },
          ],
        }),
      ]);
    });

    it('should also fetch information about complementary certification subscriptions', async function () {
      // given
      const complementaryCertificationData1 = {
        id: 1,
        label: 'ComplementaryCertif1Label',
        key: 'ComplementaryCertif1Key',
      };
      const complementaryCertificationData2 = {
        id: 2,
        label: 'ComplementaryCertif2Label',
        key: 'ComplementaryCertif2Key',
      };
      databaseBuilder.factory.buildComplementaryCertification(complementaryCertificationData1);
      databaseBuilder.factory.buildComplementaryCertification(complementaryCertificationData2);
      databaseBuilder.factory.buildComplementaryCertificationSubscription({
        certificationCandidateId: jeannetteData.id,
        complementaryCertificationId: complementaryCertificationData1.id,
      });
      databaseBuilder.factory.buildComplementaryCertificationSubscription({
        certificationCandidateId: fredericData.id,
        complementaryCertificationId: complementaryCertificationData2.id,
      });
      await databaseBuilder.commit();

      // when
      const actualEnrolledCandidates = await enrolledCandidateRepository.findBySessionId({ sessionId });

      // then
      expect(actualEnrolledCandidates).to.deepEqualArray([
        domainBuilder.certification.enrolment.buildEnrolledCandidate({
          ...jeannetteData,
          subscriptions: [
            {
              type: SUBSCRIPTION_TYPES.CORE,
              certificationCandidateId: jeannetteData.id,
              complementaryCertificationId: null,
            },
            {
              type: SUBSCRIPTION_TYPES.COMPLEMENTARY,
              certificationCandidateId: jeannetteData.id,
              complementaryCertificationId: complementaryCertificationData1.id,
            },
          ],
        }),
        domainBuilder.certification.enrolment.buildEnrolledCandidate({
          ...michelData,
          subscriptions: [
            {
              type: SUBSCRIPTION_TYPES.CORE,
              certificationCandidateId: michelData.id,
              complementaryCertificationId: null,
            },
          ],
        }),
        domainBuilder.certification.enrolment.buildEnrolledCandidate({
          ...fredericData,
          subscriptions: [
            {
              type: SUBSCRIPTION_TYPES.COMPLEMENTARY,
              certificationCandidateId: fredericData.id,
              complementaryCertificationId: complementaryCertificationData2.id,
            },
          ],
        }),
      ]);
    });
  });
});
