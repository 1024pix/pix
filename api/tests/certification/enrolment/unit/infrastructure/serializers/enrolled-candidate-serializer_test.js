import * as serializer from '../../../../../../src/certification/enrolment/infrastructure/serializers/enrolled-candidate-serializer.js';
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
        isLinked: false,
        organizationLearnerId: null,
        billingMode: CertificationCandidate.BILLING_MODES.PAID,
        prepaymentCode: 'somePrepaymentCode1',
        complementaryCertificationId: null,
        complementaryCertificationLabel: null,
        complementaryCertificationKey: null,
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
          },
        },
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
        isLinked: false,
        organizationLearnerId: null,
        billingMode: CertificationCandidate.BILLING_MODES.PAID,
        prepaymentCode: 'somePrepaymentCode1',
        complementaryCertificationId: 456,
        complementaryCertificationLabel: 'CompLabel',
        complementaryCertificationKey: 'CompKey',
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
            'complementary-certification': {
              id: enrolledCandidate.complementaryCertificationId,
              label: enrolledCandidate.complementaryCertificationLabel,
              key: enrolledCandidate.complementaryCertificationKey,
            },
          },
        },
      };

      // when
      const jsonApi = serializer.serialize(enrolledCandidate);

      // then
      expect(jsonApi).to.deep.equal(expectedJsonApiData);
    });
  });
});
