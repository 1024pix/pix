import { expect } from 'chai';

import { userCertificationEligibilitySerializer } from '../../../../../../src/certification/enrolment/infrastructure/serializers/user-certification-eligibility-serializer.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Enrolment | Unit | Serializer | user-certification-eligibility-serializer', function () {
  describe('#serialize()', function () {
    context('when there is no double certification eligibility', function () {
      it('should format certification eligibility model into into JSON API data without double certification information', function () {
        // given
        const userCertificationEligibility =
          domainBuilder.certification.enrolment.buildUserCertificationEligibility(
            {
              id: 123,
              isCertifiable: true,
              doubleCertificationEligibility: null,
              certifiableCompetencesCount: 2,
              minimumCertifiableCompetencesForCertificability: 5,
            },
          );

        // when
        const json = userCertificationEligibilitySerializer.serialize(userCertificationEligibility);

        // then
        expect(json).to.deep.equal({
          data: {
            id: '123',
            type: 'isCertifiables',
            attributes: {
              'is-certifiable': true,
              'certifiable-competences-count': 2,
              'minimum-certifiable-competences-for-certificability': 5
            },
          },
        });
      });
    });

    context('when there is double certification eligibility', function () {
      it('should format certification eligibility model into into JSON API data', function () {
        // given
        const userCertificationEligibility =
          domainBuilder.certification.enrolment.buildUserCertificationEligibility(
            {
              id: 123,
              isCertifiable: true,
              certifiableCompetencesCount: 2,
              minimumCertifiableCompetencesForCertificability: 5,
              doubleCertificationEligibility:
                domainBuilder.certification.enrolment.buildCertificationEligibility(
                  {
                    label: "Un super label",
                    imageUrl: "Une super image",
                    isBadgeValid: false,
                    validatedDoubleCertification: false,
                  },
                ),
            },
          );

        // when
        const json = userCertificationEligibilitySerializer.serialize(userCertificationEligibility);

        // then
        expect(json).to.deep.equal({
          data: {
            id: '123',
            type: 'isCertifiables',
            attributes: {
              'is-certifiable': true,
              'certifiable-competences-count': 2,
              'minimum-certifiable-competences-for-certificability': 5,
              'double-certification-eligibility': {
                label: 'Un super label',
                imageUrl: 'Une super image',
                isBadgeValid: false,
                validatedDoubleCertification: false,
              },
            },
          },
        });
      });
    });
  });
});
