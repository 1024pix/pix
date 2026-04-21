import sinon from 'sinon';

import { userController } from '../../../../../src/certification/enrolment/application/user-controller.js';
import { usecases } from '../../../../../src/certification/enrolment/domain/usecases/index.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Enrolment | Unit | Application | Controller | user-controller', function () {
  describe('#isCertifiable', function () {
    it('should return user certification eligibility', async function () {
      // given
      sinon.stub(usecases, 'getUserCertificationEligibility').resolves(
        domainBuilder.certification.enrolment.buildUserCertificationEligibility({
          id: 123,
          isCertifiable: true,
          certificationEligibility: domainBuilder.certification.enrolment.buildCertificationEligibility({
            label: 'Un super label',
            imageUrl: 'Une super image',
            isBadgeValid: true,
            validatedDoubleCertification: true,
          }),
        }),
      );

      const request = {
        auth: {
          credentials: {
            userId: 123,
          },
        },
      };

      // when
      const serializedEligibility = await userController.isCertifiable(request);

      // then
      expect(serializedEligibility).to.deep.equal({
        data: {
          id: '123',
          type: 'isCertifiables',
          attributes: {
            'is-certifiable': true,
            'double-certification-eligibility': {
              imageUrl: "url d'image",
              isBadgeValid: true,
              label: "Label d'éligibilité",
              validatedDoubleCertification: true,
            },
          },
        },
      });
    });
  });
});
