import sinon from 'sinon';

import { TargetProfile } from '../../../../../src/quest/domain/models/combined-course-blueprints/entities/TargetProfile.js';
import * as targetProfileRepository from '../../../../../src/quest/infrastructure/repositories/combined-course-blueprints/target-profile-repository.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Infrastructure | Repositories | target-profile', function () {
  describe('#findByIds', function () {
    it('should call getByIds method from targetProfileApi', async function () {
      // given
      const firstTargetProfileId = 1;
      const secondTargetProfileId = 2;
      const expectedFirstTargetProfile = new TargetProfile({
        id: firstTargetProfileId,
        name: 'targetProfileName',
        internalName: 'targetProfileInternalName',
      });
      const expectedSecondTargetProfile = new TargetProfile({
        id: secondTargetProfileId,
        name: 'targetProfileName2',
        internalName: 'targetProfileInternalName2',
      });
      const targetProfilesApiStub = {
        getByIds: sinon.stub(),
      };
      targetProfilesApiStub.getByIds
        .withArgs([firstTargetProfileId, secondTargetProfileId])
        .resolves([expectedFirstTargetProfile, expectedSecondTargetProfile]);

      // when
      const result = await targetProfileRepository.findByIds({
        ids: [firstTargetProfileId, secondTargetProfileId],
        targetProfilesApi: targetProfilesApiStub,
      });

      // then
      expect(result).to.deep.equal([expectedFirstTargetProfile, expectedSecondTargetProfile]);
    });
  });
});
