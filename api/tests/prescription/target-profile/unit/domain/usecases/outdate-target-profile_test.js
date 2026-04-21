import sinon from 'sinon';

import { usecases } from '../../../../../../src/prescription/target-profile/domain/usecases/index.js';

const { outdateTargetProfile } = usecases;

describe('Unit | Target Profile | Domain | UseCase | outdate-target-profile', function () {
  it('should delete target profile shares and mark the target profile as outdated', async function () {
    //given
    const targetProfileAdministrationRepository = {
      update: sinon.stub(),
    };
    const targetProfileBondRepository = {
      deleteByTargetProfileId: sinon.stub(),
    };

    //when
    await outdateTargetProfile({ id: 123, targetProfileAdministrationRepository, targetProfileBondRepository });

    //then
    expect(targetProfileBondRepository.deleteByTargetProfileId).to.have.been.calledOnceWithExactly(123);
    expect(targetProfileAdministrationRepository.update).to.have.been.calledOnceWithExactly({
      id: 123,
      outdated: true,
    });
  });
});
