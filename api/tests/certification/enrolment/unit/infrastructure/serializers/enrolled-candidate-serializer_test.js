import * as serializer from '../../../../../../src/certification/enrolment/infrastructure/serializers/enrolled-candidate-serializer.js';
import { SUBSCRIPTION_TYPES } from '../../../../../../src/certification/shared/domain/constants.js';
import { CertificationCandidate } from '../../../../../../src/shared/domain/models/index.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Certification | Enrolment | Unit | Serializer | enrolled-candidate-serializer', function () {
  describe('#serialize()', function () {
    it('should convert a EnrolledCandidate model object without subscriptions into JSON API data', function () {
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
            'billing-mode': enrolledCandidate.billingMode,
            'prepayment-code': enrolledCandidate.prepaymentCode,
            'birth-city': enrolledCandidate.birthCity,
            'birth-province-code': enrolledCandidate.birthProvinceCode,
            'birth-insee-code': enrolledCandidate.birthINSEECode,
            'birth-postal-code': enrolledCandidate.birthPostalCode,
            'birth-country': enrolledCandidate.birthCountry,
            birthdate: enrolledCandidate.birthdate,
            email: enrolledCandidate.email,
            'result-recipient-email': enrolledCandidate.resultRecipientEmail,
            'external-id': enrolledCandidate.externalId,
            'extra-time-percentage': enrolledCandidate.extraTimePercentage,
            'is-linked': enrolledCandidate.isLinked,
            'organization-learner-id': enrolledCandidate.organizationLearnerId,
            sex: enrolledCandidate.sex,
            'complementary-certification': null,
            'has-seen-certification-instructions': true,
          },
          relationships: {
            subscriptions: {
              data: [
                {
                  type: 'subscriptions',
                  id: `${enrolledCandidate.id}-CORE`,
                },
              ],
            },
          },
        },
        included: [
          {
            type: 'subscriptions',
            id: `${enrolledCandidate.id}-CORE`,
            attributes: {
              'complementary-certification-id': null,
              type: SUBSCRIPTION_TYPES.CORE,
            },
          },
        ],
      };

      // when
      const jsonApi = serializer.serialize(enrolledCandidate);

      // then
      expect(jsonApi).to.deep.equal(expectedJsonApiData);
    });

    it('should convert a EnrolledCandidate model object with subscriptions into JSON API data', function () {
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
        extraTimePercentage: null,
        userId: 159,
        organizationLearnerId: null,
        billingMode: CertificationCandidate.BILLING_MODES.PAID,
        prepaymentCode: 'somePrepaymentCode1',
        hasSeenCertificationInstructions: true,
        subscriptions: [
          domainBuilder.certification.enrolment.buildCoreSubscription({
            certificationCandidateId: 123,
          }),
          domainBuilder.certification.enrolment.buildComplementarySubscription({
            certificationCandidateId: 123,
            complementaryCertificationId: 456,
          }),
        ],
      });
      const expectedJsonApiData = {
        data: {
          type: 'certification-candidates',
          id: enrolledCandidate.id.toString(),
          attributes: {
            'first-name': enrolledCandidate.firstName,
            'last-name': enrolledCandidate.lastName,
            'billing-mode': enrolledCandidate.billingMode,
            'prepayment-code': enrolledCandidate.prepaymentCode,
            'birth-city': enrolledCandidate.birthCity,
            'birth-province-code': enrolledCandidate.birthProvinceCode,
            'birth-insee-code': enrolledCandidate.birthINSEECode,
            'birth-postal-code': enrolledCandidate.birthPostalCode,
            'birth-country': enrolledCandidate.birthCountry,
            birthdate: enrolledCandidate.birthdate,
            email: enrolledCandidate.email,
            'result-recipient-email': enrolledCandidate.resultRecipientEmail,
            'external-id': enrolledCandidate.externalId,
            'extra-time-percentage': enrolledCandidate.extraTimePercentage,
            'is-linked': enrolledCandidate.isLinked,
            'organization-learner-id': enrolledCandidate.organizationLearnerId,
            sex: enrolledCandidate.sex,
            'has-seen-certification-instructions': true,
            'complementary-certification': {
              id: enrolledCandidate.subscriptions[1].complementaryCertificationId,
            },
          },
          relationships: {
            subscriptions: {
              data: [
                {
                  type: 'subscriptions',
                  id: `${enrolledCandidate.id}-CORE`,
                },
                {
                  type: 'subscriptions',
                  id: `${enrolledCandidate.id}-456`,
                },
              ],
            },
          },
        },
        included: [
          {
            type: 'subscriptions',
            id: `${enrolledCandidate.id}-CORE`,
            attributes: {
              'complementary-certification-id': null,
              type: SUBSCRIPTION_TYPES.CORE,
            },
          },
          {
            type: 'subscriptions',
            id: `${enrolledCandidate.id}-456`,
            attributes: {
              'complementary-certification-id': 456,
              type: SUBSCRIPTION_TYPES.COMPLEMENTARY,
            },
          },
        ],
      };

      // when
      const jsonApi = serializer.serialize(enrolledCandidate);

      // then
      expect(jsonApi).to.deep.equal(expectedJsonApiData);
    });
  });
});
