import { userController } from '../../../../../src/certification/enrolment/application/user-controller.js';
import { usecases } from '../../../../../src/certification/enrolment/domain/usecases/index.js';
import { domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Certification | Enrolment | Unit | Application | Controller | user-controller', function () {
  describe('#isCertifiable', function () {
    it('should return user certification eligibility', async function () {
      // given
      sinon.stub(usecases, 'getUserCertificationEligibility').resolves(
        domainBuilder.certification.enrolment.buildUserCertificationEligibility({
          id: 123,
          isCertifiable: true,
          certificationEligibilities: [
            domainBuilder.certification.enrolment.buildV3CertificationEligibility({
              label: 'Un super label',
              imageUrl: 'Une super image',
              isOutdated: false,
              isAcquiredExpectedLevel: false,
            }),
          ],
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
            'complementary-certifications': [
              {
                label: 'Un super label',
                imageUrl: 'Une super image',
                isOutdated: false,
                isAcquiredExpectedLevel: false,
              },
            ],
          },
        },
      });
    });
  });
});
