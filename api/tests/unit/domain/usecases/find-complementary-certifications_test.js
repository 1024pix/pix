import { expect, domainBuilder, sinon } from '../../../test-helper';
import findComplementaryCertifications from '../../../../lib/domain/usecases/find-complementary-certifications';

describe('Unit | UseCase | find-complementary-certifications', function () {
  let complementaryCertificationRepository;

  beforeEach(function () {
    complementaryCertificationRepository = {
      findAll: sinon.stub(),
    };
  });

  it('should find the complementary certifications', async function () {
    // given
    const complementaryCertifications = [
      domainBuilder.buildComplementaryCertification({
        id: 11,
        name: 'Pix+Edu',
      }),
      domainBuilder.buildComplementaryCertification({
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
