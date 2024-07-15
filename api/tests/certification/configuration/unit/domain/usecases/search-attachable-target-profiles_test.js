import { searchAttachableTargetProfiles } from '../../../../../../src/certification/configuration/domain/usecases/search-attachable-target-profiles.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Configuration | Unit | UseCase | search-attachable-target-profiles', function () {
  it('should get attachable target profiles', async function () {
    // given
    const searchTerm = undefined;
    const attachableTargetProfileRepository = {
      find: sinon.stub(),
    };
    const expectedResult = [Symbol('targetProfile')];
    attachableTargetProfileRepository.find.withArgs({ searchTerm }).resolves(expectedResult);

    // when
    const result = await searchAttachableTargetProfiles({
      searchTerm,
      attachableTargetProfileRepository,
    });

    // then
    expect(result).to.deep.equal(expectedResult);
  });

  describe('with a term to search for', function () {
    it('should get attachable target profiles', async function () {
      // given
      const searchTerm = 'Cléa';
      const attachableTargetProfileRepository = {
        find: sinon.stub(),
      };
      const expectedResult = [Symbol('targetProfileCléa')];
      attachableTargetProfileRepository.find.withArgs({ searchTerm }).resolves(expectedResult);

      // when
      const result = await searchAttachableTargetProfiles({
        searchTerm,
        attachableTargetProfileRepository,
      });

      // then
      expect(result).to.deep.equal(expectedResult);
    });
  });
});
