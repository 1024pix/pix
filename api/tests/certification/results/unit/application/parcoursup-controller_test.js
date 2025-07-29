import { parcoursupController } from '../../../../../src/certification/results/application/parcoursup-controller.js';
import { usecases } from '../../../../../src/certification/results/domain/usecases/index.js';
import { FRENCH_FRANCE } from '../../../../../src/shared/domain/services/locale-service.js';
import { getI18n } from '../../../../../src/shared/infrastructure/i18n/i18n.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Certification | Results | Unit | Application | parcoursup-controller', function () {
  describe('#getCertificationResultForParcoursup', function () {
    it('should return a serialized certification result for parcoursup', async function () {
      // given
      const request = {
        payload: {
          ine: Symbol('ine'),
          organizationUai: Symbol('organizationUai'),
          lastName: Symbol('lastName'),
          firstName: Symbol('firstName'),
          birthdate: Symbol('birthdate'),
          verificationCode: Symbol('verificationCode'),
        },
      };

      const pixScore = Symbol('pixScore');

      const certificationResultForParcoursup = {
        pixScore,
        certificationDate: Symbol('certificationDate'),
      };
      sinon.stub(usecases, 'getCertificationResultForParcoursup');
      usecases.getCertificationResultForParcoursup
        .withArgs({ ...request.payload })
        .resolves(certificationResultForParcoursup);

      const dependencies = {
        parcoursupCertificationSerializer: {
          serialize: sinon.stub(),
        },
      };

      // when
      await parcoursupController.getCertificationResultForParcoursup(request, hFake, dependencies);

      // then
      expect(dependencies.parcoursupCertificationSerializer.serialize).to.have.been.calledOnceWithExactly({
        certificationResult: certificationResultForParcoursup,
        translate: getI18n(FRENCH_FRANCE).__,
      });
    });
  });
});
