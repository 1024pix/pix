import { EnrolledCandidate } from '../../../../../../src/certification/enrolment/domain/read-models/EnrolledCandidate.js';
import * as serializer from '../../../../../../src/certification/enrolment/infrastructure/serializers/certification-candidate-serializer.js';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | certification-candidate-serializer', function () {
  let certificationCandidate, complementaryCertification;

  beforeEach(function () {
    complementaryCertification =
      domainBuilder.certification.sessionManagement.buildCertificationSessionComplementaryCertification({
        id: 2,
        label: 'Pix+Patisserie',
        key: ComplementaryCertificationKeys.PIX_PLUS_DROIT,
      });
    certificationCandidate = domainBuilder.buildCertificationCandidate({
      organizationLearnerId: 1,
      billingMode: 'PAID',
      complementaryCertification,
      subscriptions: [domainBuilder.buildCoreSubscription()],
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
              key: ComplementaryCertificationKeys.PIX_PLUS_DROIT,
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
