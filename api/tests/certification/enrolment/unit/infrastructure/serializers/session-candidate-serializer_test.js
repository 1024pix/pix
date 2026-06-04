import * as serializer from '../../../../../../src/certification/enrolment/infrastructure/serializers/session-candidate-serializer.js';
import { CertificationCandidate } from '../../../../../../src/certification/shared/domain/models/CertificationCandidate.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Enrolment | Unit | Serializer | session-candidate-serializer', function () {
  describe('#serialize()', function () {
    it('should convert a EnrolledCandidate model object with subscriptions into JSON API data', function () {
      // given
      const sessionCandidate = domainBuilder.certification.enrolment.buildEnrolledCandidate({
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
        subscription: Frameworks.DROIT,
        accessibilityAdjustmentNeeded: true,
      });
      const expectedJsonApiData = {
        data: {
          type: 'certification-candidates',
          id: sessionCandidate.id.toString(),
          attributes: {
            'first-name': sessionCandidate.firstName,
            'last-name': sessionCandidate.lastName,
            birthdate: sessionCandidate.birthdate,
            subscription: sessionCandidate.subscription,
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
