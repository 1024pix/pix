import { CenterTypes } from '../../../../../../src/certification/enrolment/domain/models/CenterTypes.js';
import { getMassImportTemplateInformation } from '../../../../../../src/certification/enrolment/domain/usecases/get-mass-import-template-information.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Certification | Session | UseCase | get-mass-import-template-information', function () {
  context('#getMassImportTemplateInformation', function () {
    let centerRepository, complementaryCertificationRepository;

    beforeEach(function () {
      centerRepository = { getById: sinon.stub() };
      complementaryCertificationRepository = { getById: sinon.stub() };
    });

    context('when center is not SCO', function () {
      it('should return a certification center habilitations and billingMode', async function () {
        // given
        const center = domainBuilder.certification.sessionManagement.buildCenter({
          id: 1,
          type: CenterTypes.PRO,
          habilitations: [2],
        });
        const complementary =
          domainBuilder.certification.sessionManagement.buildCertificationSessionComplementaryCertification({
            id: 2,
          });
        centerRepository.getById.withArgs({ id: 1 }).resolves(center);
        complementaryCertificationRepository.getById
          .withArgs({ complementaryCertificationId: 2 })
          .resolves(complementary);

        // when
        const result = await getMassImportTemplateInformation({
          centerId: 1,
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
        const center = domainBuilder.certification.sessionManagement.buildCenter({
          id: 1,
          type: CenterTypes.SCO,
          habilitations: [2],
        });
        const complementary =
          domainBuilder.certification.sessionManagement.buildCertificationSessionComplementaryCertification({
            id: 2,
          });
        centerRepository.getById.withArgs({ id: 1 }).resolves(center);
        complementaryCertificationRepository.getById
          .withArgs({ complementaryCertificationId: 2 })
          .resolves(complementary);

        // when
        const result = await getMassImportTemplateInformation({
          centerId: 1,
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
