import _ from 'lodash';

import * as serializer from '../../../../../../../src/certification/shared/infrastructure/serializers/jsonapi/certification-candidate-serializer.js';
import { CertificationCandidate } from '../../../../../../../src/shared/domain/models/CertificationCandidate.js';
import { domainBuilder, expect } from '../../../../../../test-helper.js';

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

  describe('#serializeForApp()', function () {
    it('should convert a CertificationCandidate model object into JSON API data for app', async function () {
      // given
      const certificationCandidate = domainBuilder.certification.enrolment.buildCertificationSessionCandidate({
        firstName: 'toto',
        lastName: 'tutu',
        sessionId: 1234,
        hasSeenCertificationInstructions: true,
        birthdate: '1984-28-05',
      });

      // when
      const serializedCertificationCandidateForApp = await serializer.serializeForApp(certificationCandidate);

      // then
      expect(serializedCertificationCandidateForApp).to.deep.equal({
        data: {
          type: 'certification-candidates',
          id: certificationCandidate.id.toString(),
          attributes: {
            'first-name': 'toto',
            'last-name': 'tutu',
            birthdate: '1984-28-05',
            'session-id': 1234,
            'has-seen-certification-instructions': true,
          },
        },
      });
    });
  });
});
