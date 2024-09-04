import { userController } from '../../../../../src/certification/enrolment/application/user-controller.js';
import { usecases } from '../../../../../src/certification/enrolment/domain/usecases/index.js';
import { domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Certification | Enrolment | Unit | Application | Controller | user-controller', function () {
  describe('#isCertifiable', function () {
    it('should return user certification eligibility', async function () {
      // given
      const certificationEligibility = domainBuilder.certification.enrolment.buildCertificationEligibility({
        id: 123,
        pixCertificationEligible: true,
        complementaryCertifications: ['Pix+ Droit Maître', 'Pix+ Édu 1er degré Avancé'],
      });
      sinon
        .stub(usecases, 'getUserCertificationEligibility')
        .withArgs({ userId: 123 })
        .resolves(certificationEligibility);
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
            'complementary-certifications': ['Pix+ Droit Maître', 'Pix+ Édu 1er degré Avancé'],
          },
        },
      });
    });
  });
});
