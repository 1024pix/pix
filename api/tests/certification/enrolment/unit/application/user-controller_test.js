import { userController } from '../../../../../src/certification/enrolment/application/user-controller.js';
import { usecases } from '../../../../../src/certification/enrolment/domain/usecases/index.js';
import { config } from '../../../../../src/shared/config.js';
import { domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Certification | Enrolment | Unit | Application | Controller | user-controller', function () {
  describe('#isCertifiable', function () {
    describe('if V3 certification feature toggle is activated', function () {
      it('should return user certification eligibility', async function () {
        // given
        sinon.stub(config.featureToggles, 'isV3EligibilityCheckEnabled').value(true);

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

    describe('if V3 certification feature toggle is not activated', function () {
      it('should return user certification eligibility', async function () {
        // given
        sinon.stub(config.featureToggles, 'isV3EligibilityCheckEnabled').value(false);
        const certificationEligibility = domainBuilder.certification.enrolment.buildCertificationEligibility({
          id: 123,
          pixCertificationEligible: true,
          complementaryCertifications: ['Pix+ Droit Maître', 'Pix+ Édu 1er degré Avancé'],
        });
        sinon
          .stub(usecases, 'getV2UserCertificationEligibility')
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
});
