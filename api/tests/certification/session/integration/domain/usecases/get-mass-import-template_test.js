import { catchErr, expect, databaseBuilder } from '../../../../../test-helper.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { usecases } from '../../../../../../src/certification/session/domain/usecases/index.js';
import { CenterTypes } from '../../../../../../src/certification/session/domain/models/CenterTypes.js';

describe('Integration | Certification | Session | UseCase | get-mass-import-template ', function () {
  describe('#getMassImportTemplate', function () {
    it('should return a certification center habilitations and billingMode', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
        type: CenterTypes.SUP,
        externalId: '1234AB',
        isV3Pilot: false,
      }).id;
      const complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification.clea({}).id;
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId,
        complementaryCertificationId,
      });
      await databaseBuilder.commit();

      // when
      const result = await usecases.getMassImportTemplate({ certificationCenterId });

      // then
      expect(result).to.deep.equal({
        habilitationLabels: ['CléA Numérique'],
        shouldDisplayBillingModeColumns: true,
      });
    });

    context('when certification center does not exist', function () {
      it('should throw NotFoundError', async function () {
        // given
        const unknownCertificationCenterId = 999999;

        // when
        const error = await catchErr(usecases.getMassImportTemplate)({
          certificationCenterId: unknownCertificationCenterId,
        });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.equal(`Certification center not found`);
      });
    });
  });
});
