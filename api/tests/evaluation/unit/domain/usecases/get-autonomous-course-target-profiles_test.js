import { getAutonomousCourseTargetProfiles } from '../../../../../src/evaluation/domain/usecases/get-autonomous-course-target-profiles.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Domain | Use Cases | get-autonomous-course-target-profile', function () {
  it('should return a list of target profiles', async function () {
    // given
    const expectedTargetProfiles = Symbol('targetProfiles');

    const autonomousCourseTargetProfileRepository = {
      get: sinon.stub().resolves(expectedTargetProfiles),
    };

    // when
    const targetProfilesList = await getAutonomousCourseTargetProfiles({ autonomousCourseTargetProfileRepository });

    //then
    expect(autonomousCourseTargetProfileRepository.get).to.have.been.calledOnce;
    expect(targetProfilesList).to.deep.equal(expectedTargetProfiles);
  });
});
