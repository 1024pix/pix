import { usecases } from '../../../../../../src/prescription/target-profile/domain/usecases/index.js';
import { expect, sinon } from '../../../../../test-helper.js';

const { outdateTargetProfile } = usecases;

describe('Unit | Target Profile | Domain | UseCase | outdate-target-profile', function () {
  it('should call repository method to update a target profile name', async function () {
    //given
    const targetProfileAdministrationRepository = {
      update: sinon.stub(),
    };

    //when
    await outdateTargetProfile({ id: 123, outdated: true, targetProfileAdministrationRepository });

    //then
    expect(targetProfileAdministrationRepository.update).to.have.been.calledOnceWithExactly({
      id: 123,
      outdated: true,
    });
  });
});
