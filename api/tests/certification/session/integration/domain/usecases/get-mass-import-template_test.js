import { catchErr, expect } from '../../../../../test-helper.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { usecases } from '../../../../../../src/certification/session/domain/usecases/index.js';

describe('Integration | Certification | Session | UseCase | get-mass-import-template ', function () {
  context('#getMassImportTemplate', function () {
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
