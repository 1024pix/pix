import { expect, sinon } from '../../../test-helper.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';

describe('Unit | UseCase | search-attachable-target-profiles-for-admin', function () {
  it('should get attachable target profiles for admin', async function () {
    // given
    const searchTerm = undefined;
    const targetProfileAttachableForAdminRepository = {
      find: sinon.stub(),
    };
    const expectedResult = [Symbol('targetProfile')];
    targetProfileAttachableForAdminRepository.find.withArgs({ searchTerm }).resolves(expectedResult);

    // when
    const result = await usecases.searchAttachableTargetProfilesForAdmin({
      searchTerm,
      targetProfileAttachableForAdminRepository,
    });

    // then
    expect(result).to.deep.equal(expectedResult);
  });

  describe('with a term to search for', function () {
    it('should get attachable target profiles for admin', async function () {
      // given
      const searchTerm = 'Cléa';
      const targetProfileAttachableForAdminRepository = {
        find: sinon.stub(),
      };
      const expectedResult = [Symbol('targetProfileCléa')];
      targetProfileAttachableForAdminRepository.find.withArgs({ searchTerm }).resolves(expectedResult);

      // when
      const result = await usecases.searchAttachableTargetProfilesForAdmin({
        searchTerm,
        targetProfileAttachableForAdminRepository,
      });

      // then
      expect(result).to.deep.equal(expectedResult);
    });
  });
});
