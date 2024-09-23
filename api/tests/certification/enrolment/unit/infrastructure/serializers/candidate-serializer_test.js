import * as serializer from '../../../../../../src/certification/enrolment/infrastructure/serializers/candidate-serializer.js';
import { SUBSCRIPTION_TYPES } from '../../../../../../src/certification/shared/domain/constants.js';
import { CertificationCandidate } from '../../../../../../src/shared/domain/models/index.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Certification | Enrolment | Unit | Serializer | candidate', function () {
  context('#serializeId', function () {
    it('should return a serialized JSON data object', function () {
      // given
      const candidateId = 123;
      const expectedSerializedResult = {
        data: {
          id: '123',
          type: 'certification-candidates',
        },
      };

      // when
      const result = serializer.serializeId(candidateId);

      // then
      expect(result).to.deep.equal(expectedSerializedResult);
    });
  });

  context('#deserialize', function () {
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
        userId: 777,
        sessionId: 888,
        organizationLearnerId: 999,
        authorizedToStart: false,
        complementaryCertificationId: null,
        billingMode: CertificationCandidate.BILLING_MODES.FREE,
        prepaymentCode: null,
        hasSeenCertificationInstructions: false,
        subscriptions: [],
      };
    });

    it('should deserialize correctly candidate with subscriptions', async function () {
      // given
      const candidateJsonApiData = {
        data: {
          type: 'certification-candidates',
          id: null,
          attributes: {
            'first-name': candidateData.firstName,
            'last-name': candidateData.lastName,
            'created-at': candidateData.createdAt,
            sex: candidateData.sex,
            'birth-city': candidateData.birthCity,
            'birth-province-code': candidateData.birthProvinceCode,
            'birth-country': candidateData.birthCountry,
            'birth-insee-code': candidateData.birthINSEECode,
            'birth-postal-code': candidateData.birthPostalCode,
            email: candidateData.email,
            'result-recipient-email': candidateData.resultRecipientEmail,
            birthdate: candidateData.birthdate,
            'extra-time-percentage': candidateData.extraTimePercentage,
            'external-id': candidateData.externalId,
            'user-id': candidateData.userId,
            'session-id': candidateData.sessionId,
            'organization-learner-id': candidateData.organizationLearnerId,
            'authorized-to-start': candidateData.authorizedToStart,
            'billing-mode': candidateData.billingMode,
            'prepayment-code': candidateData.prepaymentCode,
            'has-seen-certification-instructions': candidateData.hasSeenCertificationInstructions,
            subscriptions: [
              {
                complementaryCertificationId: 777,
                type: SUBSCRIPTION_TYPES.COMPLEMENTARY,
              },
              {
                complementaryCertificationId: null,
                type: SUBSCRIPTION_TYPES.CORE,
              },
            ],
          },
        },
      };

      // when
      const deserializedCandidate = await serializer.deserialize(candidateJsonApiData);

      // then
      expect(deserializedCandidate).to.deepEqualInstance(
        domainBuilder.certification.enrolment.buildCandidate({
          ...candidateData,
          complementaryCertificationId: 777,
          subscriptions: [
            domainBuilder.buildComplementarySubscription({
              certificationCandidateId: null,
              complementaryCertificationId: 777,
            }),
            domainBuilder.buildCoreSubscription({ certificationCandidateId: null }),
          ],
        }),
      );
    });
  });

  describe('#serializeForParticipation()', function () {
    it('should convert a EnrolledCandidate model object into JSON API data', function () {
      // given
      const enrolledCandidate = domainBuilder.certification.enrolment.buildEnrolledCandidate({
        id: 123,
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
        sessionId: 555,
        extraTimePercentage: null,
        userId: null,
        organizationLearnerId: null,
        billingMode: CertificationCandidate.BILLING_MODES.PAID,
        prepaymentCode: 'somePrepaymentCode1',
        subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription({ certificationCandidateId: 123 })],
        hasSeenCertificationInstructions: true,
      });
      const expectedJsonApiData = {
        data: {
          type: 'certification-candidates',
          id: enrolledCandidate.id.toString(),
          attributes: {
            'first-name': enrolledCandidate.firstName,
            'last-name': enrolledCandidate.lastName,
            birthdate: enrolledCandidate.birthdate,
            'has-seen-certification-instructions': true,
            'session-id': enrolledCandidate.sessionId,
          },
        },
      };

      // when
      const jsonApi = serializer.serializeForParticipation(enrolledCandidate);

      // then
      expect(jsonApi).to.deep.equal(expectedJsonApiData);
    });
  });
});
