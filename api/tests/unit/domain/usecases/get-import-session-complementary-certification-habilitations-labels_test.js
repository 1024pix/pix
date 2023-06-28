import { sinon, expect, domainBuilder } from '../../../test-helper.js';
import { getImportSessionComplementaryCertificationHabilitationsLabels } from '../../../../lib/shared/domain/usecases/get-import-session-complementary-certification-habilitations-labels.js';

describe('Unit | Usecase | get-import-session-complementary-certification-habilitations-labels', function () {
  it('should return the certification center  habilitations labels', async function () {
    // given
    const complementaryCertificationHabilitationRepository = { findByCertificationCenterId: sinon.stub() };
    complementaryCertificationHabilitationRepository.findByCertificationCenterId.withArgs(123).resolves([
      domainBuilder.buildComplementaryCertification({
        label: 'Pix Plus Toto',
      }),
      domainBuilder.buildComplementaryCertification({
        label: 'Pix Plus Tata',
      }),
    ]);

    // when
    const habilitationsLabels = await getImportSessionComplementaryCertificationHabilitationsLabels({
      certificationCenterId: 123,
      complementaryCertificationHabilitationRepository,
    });

    // then
    const expectedHabilitationsLabels = ['Pix Plus Toto', 'Pix Plus Tata'];
    expect(habilitationsLabels).to.deepEqualInstance(expectedHabilitationsLabels);
  });
});
