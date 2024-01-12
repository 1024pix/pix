import { expect, sinon, domainBuilder } from '../../../../../test-helper.js';
import { getMassImportTemplate } from '../../../../../../src/certification/session/domain/usecases/get-mass-import-template.js';
import { CenterTypes } from '../../../../../../src/certification/session/domain/models/CenterTypes.js';

describe('Unit | Certification | Session | UseCase | get-mass-import-template ', function () {
  context('#getMassImportTemplate', function () {
    let centerRepository, complementaryCertificationRepository;

    beforeEach(function () {
      centerRepository = { getById: sinon.stub() };
      complementaryCertificationRepository = { getById: sinon.stub() };
    });

    context('when center is not SCO', function () {
      it('should return a certification center habilitations and billingMode', async function () {
        // given
        const center = domainBuilder.certification.session.buildCenter({
          id: 1,
          type: CenterTypes.PRO,
          habilitations: [2],
        });
        const complementary = domainBuilder.certification.session.buildCertificationSessionComplementaryCertification({
          id: 2,
        });
        centerRepository.getById.withArgs({ id: 1 }).resolves(center);
        complementaryCertificationRepository.getById
          .withArgs({ complementaryCertificationId: 2 })
          .resolves(complementary);

        // when
        const result = await getMassImportTemplate({
          certificationCenterId: 1,
          centerRepository,
          complementaryCertificationRepository,
        });

        // then
        expect(result).to.deep.equal({
          habilitationLabels: ['JACKSON'],
          shouldDisplayBillingModeColumns: true,
        });
      });
    });

    context('when center is SCO', function () {
      it('should return a certification center habilitations and billingMode', async function () {
        // given
        const center = domainBuilder.certification.session.buildCenter({
          id: 1,
          type: CenterTypes.SCO,
          habilitations: [2],
        });
        const complementary = domainBuilder.certification.session.buildCertificationSessionComplementaryCertification({
          id: 2,
        });
        centerRepository.getById.withArgs({ id: 1 }).resolves(center);
        complementaryCertificationRepository.getById
          .withArgs({ complementaryCertificationId: 2 })
          .resolves(complementary);

        // when
        const result = await getMassImportTemplate({
          certificationCenterId: 1,
          centerRepository,
          complementaryCertificationRepository,
        });

        // then
        expect(result).to.deep.equal({
          habilitationLabels: ['JACKSON'],
          shouldDisplayBillingModeColumns: false,
        });
      });
    });
  });
});
