import sinon from 'sinon';

import { findComplementaryCertifications } from '../../../../../../src/certification/configuration/domain/usecases/find-complementary-certifications.js';

import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Configuration | Unit | UseCase | find-complementary-certifications', function () {
  let complementaryCertificationRepository;

  beforeEach(function () {
    complementaryCertificationRepository = {
      findAll: sinon.stub(),
    };
  });

  it('should find the complementary certifications', async function () {
    // given
    const complementaryCertifications = [
      domainBuilder.certification.shared.buildComplementaryCertification({
        id: 11,
        name: 'Pix+Edu',
      }),
      domainBuilder.certification.shared.buildComplementaryCertification({
        id: 22,
        name: 'Cléa Numérique',
      }),
    ];
    complementaryCertificationRepository.findAll.resolves(complementaryCertifications);

    // when
    const result = await findComplementaryCertifications({
      complementaryCertificationRepository,
    });

    // then
    expect(result).to.deep.equal(complementaryCertifications);
  });
});
