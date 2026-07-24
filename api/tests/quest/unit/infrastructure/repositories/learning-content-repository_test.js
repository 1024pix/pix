import sinon from 'sinon';

import * as learningContentRepository from '../../../../../src/quest/infrastructure/repositories/learning-content-repository.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Repositories | Learning Content Repository', function () {
  describe('#findByTubeIds', function () {
    it('should call findByTubeIds from learningContentApi', async function () {
      // given
      const tubeIds = [1, 2];
      const tubes = [{ id: 'tubeId1' }];
      const learningContentApiStub = {
        findByTubeIds: sinon.stub(),
      };
      learningContentApiStub.findByTubeIds.withArgs({ tubeIds }).resolves(tubes);

      // when
      await learningContentRepository.findByTubeIds({ tubeIds, learningContentApi: learningContentApiStub });

      // then
      expect(learningContentApiStub.findByTubeIds).called;
    });
  });
});
