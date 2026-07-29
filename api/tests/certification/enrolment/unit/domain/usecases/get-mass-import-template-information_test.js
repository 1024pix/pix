import sinon from 'sinon';

import { getMassImportTemplateInformation } from '../../../../../../src/certification/enrolment/domain/usecases/get-mass-import-template-information.js';
import { CenterTypes } from '../../../../../../src/organizational-entities/domain/read-models/CenterTypes.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Certification | Session | UseCase | get-mass-import-template-information', function () {
  context('#getMassImportTemplateInformation', function () {
    let centerRepository;

    beforeEach(function () {
      centerRepository = { getById: sinon.stub() };
    });

    context('when center is not SCO', function () {
      it('should return a certification center habilitations and billingMode', async function () {
        // given
        const habilitation = domainBuilder.certification.enrolment.buildHabilitation({
          complementaryCertificationId: 2,
          key: 'JACKSON_KEY',
          label: 'JACKSON',
        });
        const center = domainBuilder.certification.enrolment.buildCenter({
          id: 1,
          type: CenterTypes.PRO,
          habilitations: [habilitation],
        });

        centerRepository.getById.withArgs({ id: 1 }).resolves(center);

        // when
        const result = await getMassImportTemplateInformation({
          centerId: 1,
          centerRepository,
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
        const center = domainBuilder.certification.enrolment.buildCenter({
          id: 1,
          type: CenterTypes.SCO,
          habilitations: [],
        });

        centerRepository.getById.withArgs({ id: 1 }).resolves(center);

        // when
        const result = await getMassImportTemplateInformation({
          centerId: 1,
          centerRepository,
        });

        // then
        expect(result).to.deep.equal({
          habilitationLabels: [],
          shouldDisplayBillingModeColumns: false,
        });
      });
    });
  });
});
