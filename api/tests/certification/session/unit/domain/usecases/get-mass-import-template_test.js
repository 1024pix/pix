import { expect, sinon, domainBuilder } from '../../../../../test-helper.js';
import { getMassImportTemplate } from '../../../../../../src/certification/session/domain/usecases/get-mass-import-template.js';
import { Center } from '../../../../../../src/certification/session/domain/models/Center.js';

describe('Unit | Certification | Session | UseCase | get-mass-import-template ', function () {
  context('#getMassImportTemplate', function () {
    let centerRepository;

    beforeEach(function () {
      centerRepository = { getById: sinon.stub() };
    });

    it('should return a certification center', async function () {
      // given
      const center = domainBuilder.certification.session.buildCenter({ id: 1, type: 'SUP', hasBillingMode: true });
      centerRepository.getById.withArgs({ id: 1 }).resolves(center);

      // when
      const result = await getMassImportTemplate({ certificationCenterId: 1, centerRepository });

      // then
      expect(result).to.deepEqualInstance(
        new Center({
          id: 1,
          type: 'SUP',
          hasBillingMode: true,
        }),
      );
    });
  });
});
