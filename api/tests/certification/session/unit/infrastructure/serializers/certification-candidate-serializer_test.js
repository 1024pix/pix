import { expect, domainBuilder } from '../../../../../test-helper.js';
import * as serializer from '../../../../../../src/certification/session/infrastructure/serializers/jsonapi/certification-candidate-serializer.js';
import { EnrolledCandidate } from '../../../../../../src/certification/session/domain/read-models/EnrolledCandidate.js';

describe('Unit | Serializer | JSONAPI | certification-candidate-serializer', function () {
  let certificationCandidate, complementaryCertification;

  beforeEach(function () {
    complementaryCertification = domainBuilder.buildComplementaryCertification({
      id: 2,
      label: 'Pix+Patisserie',
      key: 'PATISSERIE',
    });
    certificationCandidate = domainBuilder.buildCertificationCandidate({
      organizationLearnerId: 1,
      billingMode: 'PAID',
      complementaryCertification,
    });
  });

  describe('#serialize()', function () {
    it('should convert a CertificationCandidate model object into JSON API data', function () {
      // given
      const sessionCandidate = EnrolledCandidate.fromCandidateAndComplementaryCertification({
        candidate: certificationCandidate,
        complementaryCertification,
      });
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
      const jsonApi = serializer.serialize(sessionCandidate);

      // then
      expect(jsonApi).to.deep.equal(expectedJsonApiData);
    });

    context('when candidate has no complementary certification', function () {
      it('should convert a CertificationCandidate model object into JSON API data', function () {
        // given
        const sessionCandidate = EnrolledCandidate.fromCandidateAndComplementaryCertification({
          candidate: certificationCandidate,
          complementaryCertification: null,
        });

        const expectedJsonApiData = {
          data: {
            type: 'certification-candidates',
            id: sessionCandidate.id.toString(),
            attributes: {
              'first-name': sessionCandidate.firstName,
              'last-name': sessionCandidate.lastName,
              'billing-mode': 'PAID',
              'prepayment-code': null,
              'birth-city': sessionCandidate.birthCity,
              'birth-province-code': sessionCandidate.birthProvinceCode,
              'birth-insee-code': sessionCandidate.birthINSEECode,
              'birth-postal-code': sessionCandidate.birthPostalCode,
              'birth-country': sessionCandidate.birthCountry,
              birthdate: sessionCandidate.birthdate,
              email: sessionCandidate.email,
              'result-recipient-email': sessionCandidate.resultRecipientEmail,
              'external-id': sessionCandidate.externalId,
              'extra-time-percentage': sessionCandidate.extraTimePercentage,
              'is-linked': true,
              'organization-learner-id': 1,
              sex: sessionCandidate.sex,
              'complementary-certification': null,
            },
          },
        };

        // when
        const jsonApi = serializer.serialize(sessionCandidate);

        // then
        expect(jsonApi).to.deep.equal(expectedJsonApiData);
      });
    });
  });
});
