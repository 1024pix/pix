import { usecases } from '../../../../../../src/certification/enrolment/domain/usecases/index.js';
import { CERTIFICATION_CENTER_TYPES } from '../../../../../../src/shared/constants.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Integration | Certification | Enrolment | UseCase | get-mass-import-template-information ', function () {
  describe('#getMassImportTemplateInformation', function () {
    it('should return a certification center habilitations and billingMode', async function () {
      // given
      const centerId = databaseBuilder.factory.buildCertificationCenter({
        type: CERTIFICATION_CENTER_TYPES.SUP,
        externalId: '1234AB',
      }).id;
      const complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification.clea({}).id;
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId: centerId,
        complementaryCertificationId,
      });
      await databaseBuilder.commit();

      // when
      const result = await usecases.getMassImportTemplateInformation({ centerId });

      // then
      expect(result).to.deep.equal({
        habilitationLabels: ['CléA Numérique'],
        shouldDisplayBillingModeColumns: true,
      });
    });

    context('when certification center does not exist', function () {
      it('should throw NotFoundError', async function () {
        // given
        const unknownCenterId = 999999;

        // when
        const error = await catchErr(usecases.getMassImportTemplateInformation)({
          centerId: unknownCenterId,
        });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.equal('Center not found');
      });
    });
  });
});
