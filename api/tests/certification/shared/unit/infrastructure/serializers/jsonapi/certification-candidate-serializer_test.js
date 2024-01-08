import { expect, domainBuilder } from '../../../../../../test-helper.js';
import { CertificationCandidate } from '../../../../../../../lib/domain/models/CertificationCandidate.js';
import * as serializer from '../../../../../../../src/certification/shared/infrastructure/serializers/jsonapi/certification-candidate-serializer.js';
import _ from 'lodash';

describe('Unit | Serializer | JSONAPI | certification-candidate-serializer', function () {
  let certificationCandidate;

  beforeEach(function () {
    certificationCandidate = domainBuilder.buildCertificationCandidate({
      organizationLearnerId: 1,
      billingMode: 'PAID',
      complementaryCertification: domainBuilder.buildComplementaryCertification({
        id: 2,
        label: 'Pix+Patisserie',
        key: 'PATISSERIE',
      }),
    });
  });

  describe('#serialize()', function () {
    it('should convert a CertificationCandidate model object into JSON API data', function () {
      // given
      const expectedJsonApiData = {
        data: {
          type: 'certification-candidates',
          id: certificationCandidate.id.toString(),
          attributes: {
            'first-name': certificationCandidate.firstName,
            'last-name': certificationCandidate.lastName,
            'billing-mode': 'PAID',
            'prepayment-code': null,
            'birth-city': certificationCandidate.birthCity,
            'birth-province-code': certificationCandidate.birthProvinceCode,
            'birth-insee-code': certificationCandidate.birthINSEECode,
            'birth-postal-code': certificationCandidate.birthPostalCode,
            'birth-country': certificationCandidate.birthCountry,
            birthdate: certificationCandidate.birthdate,
            email: certificationCandidate.email,
            'result-recipient-email': certificationCandidate.resultRecipientEmail,
            'external-id': certificationCandidate.externalId,
            'extra-time-percentage': certificationCandidate.extraTimePercentage,
            'is-linked': true,
            'organization-learner-id': 1,
            sex: certificationCandidate.sex,
            'complementary-certification': {
              id: 2,
              label: 'Pix+Patisserie',
              key: 'PATISSERIE',
            },
          },
        },
      };

      // when
      const jsonApi = serializer.serialize(certificationCandidate);

      // then
      expect(jsonApi).to.deep.equal(expectedJsonApiData);
    });

    context('when candidate has no complementary certification', function () {
      it('should convert a CertificationCandidate model object into JSON API data', function () {
        // given
        const certificationCandidateWithoutComplementary = domainBuilder.buildCertificationCandidate({
          organizationLearnerId: 1,
          billingMode: 'PAID',
          complementaryCertification: null,
        });
        const expectedJsonApiData = {
          data: {
            type: 'certification-candidates',
            id: certificationCandidateWithoutComplementary.id.toString(),
            attributes: {
              'first-name': certificationCandidateWithoutComplementary.firstName,
              'last-name': certificationCandidateWithoutComplementary.lastName,
              'billing-mode': 'PAID',
              'prepayment-code': null,
              'birth-city': certificationCandidateWithoutComplementary.birthCity,
              'birth-province-code': certificationCandidateWithoutComplementary.birthProvinceCode,
              'birth-insee-code': certificationCandidateWithoutComplementary.birthINSEECode,
              'birth-postal-code': certificationCandidateWithoutComplementary.birthPostalCode,
              'birth-country': certificationCandidateWithoutComplementary.birthCountry,
              birthdate: certificationCandidateWithoutComplementary.birthdate,
              email: certificationCandidateWithoutComplementary.email,
              'result-recipient-email': certificationCandidateWithoutComplementary.resultRecipientEmail,
              'external-id': certificationCandidateWithoutComplementary.externalId,
              'extra-time-percentage': certificationCandidateWithoutComplementary.extraTimePercentage,
              'is-linked': true,
              'organization-learner-id': 1,
              sex: certificationCandidateWithoutComplementary.sex,
              'complementary-certification': null,
            },
          },
        };

        // when
        const jsonApi = serializer.serialize(certificationCandidateWithoutComplementary);

        // then
        expect(jsonApi).to.deep.equal(expectedJsonApiData);
      });
    });

    context('when candidate is not linked to a user', function () {
      it('should convert a CertificationCandidate model object into JSON API data', function () {
        // given
        const certificationCandidateNotLinkedToUser = domainBuilder.buildCertificationCandidate({
          organizationLearnerId: 1,
          billingMode: 'PAID',
          complementaryCertification: null,
          userId: null,
        });
        const expectedJsonApiData = {
          data: {
            type: 'certification-candidates',
            id: certificationCandidateNotLinkedToUser.id.toString(),
            attributes: {
              'first-name': certificationCandidateNotLinkedToUser.firstName,
              'last-name': certificationCandidateNotLinkedToUser.lastName,
              'billing-mode': 'PAID',
              'prepayment-code': null,
              'birth-city': certificationCandidateNotLinkedToUser.birthCity,
              'birth-province-code': certificationCandidateNotLinkedToUser.birthProvinceCode,
              'birth-insee-code': certificationCandidateNotLinkedToUser.birthINSEECode,
              'birth-postal-code': certificationCandidateNotLinkedToUser.birthPostalCode,
              'birth-country': certificationCandidateNotLinkedToUser.birthCountry,
              birthdate: certificationCandidateNotLinkedToUser.birthdate,
              email: certificationCandidateNotLinkedToUser.email,
              'result-recipient-email': certificationCandidateNotLinkedToUser.resultRecipientEmail,
              'external-id': certificationCandidateNotLinkedToUser.externalId,
              'extra-time-percentage': certificationCandidateNotLinkedToUser.extraTimePercentage,
              'is-linked': false,
              'organization-learner-id': 1,
              sex: certificationCandidateNotLinkedToUser.sex,
              'complementary-certification': null,
            },
          },
        };

        // when
        const jsonApi = serializer.serialize(certificationCandidateNotLinkedToUser);

        // then
        expect(jsonApi).to.deep.equal(expectedJsonApiData);
      });
    });
  });

  describe('#deserialize()', function () {
    it('should convert JSON API data into a CertificationCandidate model object', async function () {
      // given
      const jsonApiData = {
        data: {
          type: 'certification-candidates',
          id: certificationCandidate.id.toString(),
          attributes: {
            'first-name': certificationCandidate.firstName,
            'last-name': certificationCandidate.lastName,
            'birth-city': certificationCandidate.birthCity,
            'birth-province-code': certificationCandidate.birthProvinceCode,
            'birth-country': certificationCandidate.birthCountry,
            email: certificationCandidate.email,
            'result-recipient-email': certificationCandidate.resultRecipientEmail,
            birthdate: certificationCandidate.birthdate,
            'external-id': certificationCandidate.externalId,
            'extra-time-percentage': certificationCandidate.extraTimePercentage,
            'is-linked': !_.isNil(certificationCandidate.userId),
            'organization-learner-id': certificationCandidate.organizationLearnerId,
          },
        },
      };

      // when
      const deserializedCertificationCandidate = await serializer.deserialize(jsonApiData);

      // then
      expect(deserializedCertificationCandidate).to.be.instanceOf(CertificationCandidate);
      expect(deserializedCertificationCandidate.firstName).to.equal(certificationCandidate.firstName);
      expect(deserializedCertificationCandidate.lastName).to.equal(certificationCandidate.lastName);
      expect(deserializedCertificationCandidate.birthdate).to.equal(certificationCandidate.birthdate);
      expect(deserializedCertificationCandidate.birthProvinceCode).to.equal(certificationCandidate.birthProvinceCode);
      expect(deserializedCertificationCandidate.birthCity).to.equal(certificationCandidate.birthCity);
      expect(deserializedCertificationCandidate.birthCountry).to.equal(certificationCandidate.birthCountry);
      expect(deserializedCertificationCandidate.extraTimePercentage).to.equal(
        certificationCandidate.extraTimePercentage,
      );
      expect(deserializedCertificationCandidate.externalId).to.equal(certificationCandidate.externalId);
      expect(deserializedCertificationCandidate.email).to.equal(certificationCandidate.email);
      expect(deserializedCertificationCandidate.resultRecipientEmail).to.equal(
        certificationCandidate.resultRecipientEmail,
      );
      expect(deserializedCertificationCandidate.organizationLearnerId).to.equal(
        certificationCandidate.organizationLearnerId,
      );
    });
  });
});
