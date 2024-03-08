import { usecases } from '../../../../lib/domain/usecases/index.js';
import { expect, sinon } from '../../../test-helper.js';

const { outdateTargetProfile } = usecases;

describe('Unit | UseCase | outdate-target-profile', function () {
  it('should call repository method to update a target profile name', async function () {
    //given
    const targetProfileRepository = {
      update: sinon.stub(),
    };

    //when
    await outdateTargetProfile({ id: 123, outdated: true, targetProfileRepository });

    //then
    expect(targetProfileRepository.update).to.have.been.calledOnceWithExactly({ id: 123, outdated: true });
  });
});
