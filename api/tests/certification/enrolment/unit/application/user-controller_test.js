import { expect } from 'chai';
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
          doubleCertificationEligibility: domainBuilder.certification.enrolment.buildDoubleCertificationEligibility({
            label: 'Un super label',
            imageUrl: 'Une super image',
            isEligible: true,
            certificationAlreadySucceeded: false,
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
              imageUrl: 'Une super image',
              isEligible: true,
              label: 'Un super label',
              certificationAlreadySucceeded: false,
            },
          },
        },
      });
    });
  });
});
