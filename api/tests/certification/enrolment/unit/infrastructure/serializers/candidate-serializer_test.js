import * as serializer from '../../../../../../src/certification/enrolment/infrastructure/serializers/candidate-serializer.js';
import { SubscriptionTypes } from '../../../../../../src/certification/shared/domain/models/SubscriptionTypes.js';
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

    it('should deserialize correctly candidate (core subscription by default)', async function () {
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
            'complementary-certification': null,
            'billing-mode': candidateData.billingMode,
            'prepayment-code': candidateData.prepaymentCode,
            'has-seen-certification-instructions': candidateData.hasSeenCertificationInstructions,
          },
        },
      };

      // when
      const deserializedCandidate = await serializer.deserialize(candidateJsonApiData);

      // then
      expect(deserializedCandidate).to.deepEqualInstance(
        domainBuilder.certification.enrolment.buildCandidate({
          ...candidateData,
          subscriptions: [
            {
              type: SubscriptionTypes.CORE,
              complementaryCertificationId: null,
              complementaryCertificationLabel: null,
              complementaryCertificationKey: null,
            },
          ],
        }),
      );
    });

    it('should deserialize correctly candidate with id not null (core subscription by default)', async function () {
      // given
      candidateData.id = 123;
      const candidateJsonApiData = {
        data: {
          type: 'certification-candidates',
          id: candidateData.id.toString(),
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
            'complementary-certification': null,
            'billing-mode': candidateData.billingMode,
            'prepayment-code': candidateData.prepaymentCode,
            'has-seen-certification-instructions': candidateData.hasSeenCertificationInstructions,
          },
        },
      };

      // when
      const deserializedCandidate = await serializer.deserialize(candidateJsonApiData);

      // then
      expect(deserializedCandidate).to.deepEqualInstance(
        domainBuilder.certification.enrolment.buildCandidate({
          ...candidateData,
          subscriptions: [
            {
              type: SubscriptionTypes.CORE,
              complementaryCertificationId: null,
              complementaryCertificationLabel: null,
              complementaryCertificationKey: null,
            },
          ],
        }),
      );
    });

    it('should deserialize correctly candidate with complementary subscription (core subscription by default)', async function () {
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
            'complementary-certification': {
              id: 777,
              key: 'compKey',
              label: 'compLabel',
            },
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
            {
              type: SubscriptionTypes.CORE,
              complementaryCertificationId: null,
              complementaryCertificationLabel: null,
              complementaryCertificationKey: null,
            },
            {
              type: SubscriptionTypes.COMPLEMENTARY,
              complementaryCertificationId: 777,
              complementaryCertificationLabel: 'compLabel',
              complementaryCertificationKey: 'compKey',
            },
          ],
        }),
      );
    });
  });
});
