import sinon from 'sinon';

import { findByTubeIds } from '../../../../../src/learning-content/application/api/learning-content-api.js';
import LearningContentDTO from '../../../../../src/learning-content/application/api/models/LearningContentDTO.js';
import { usecases } from '../../../../../src/learning-content/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
describe('LearningContent | Unit | Application | Api | learning-content', function () {
  describe('#findByTubeIds', function () {
    let getLearningContentByTubeIds;

    beforeEach(function () {
      getLearningContentByTubeIds = sinon.stub(usecases, 'getLearningContentByTubeIds');
    });
    it('returns a list of FrameworkWithAreasDTO', async function () {
      // given
      const area1 = domainBuilder.learningContent.buildArea();
      const area2 = domainBuilder.learningContent.buildArea();
      const area3 = domainBuilder.learningContent.buildArea();

      getLearningContentByTubeIds.resolves([
        domainBuilder.learningContent.buildFramework({
          id: 'frameworkA',
          name: 'Framework A',
          areas: [area1, area2],
        }),
        domainBuilder.learningContent.buildFramework({
          id: 'frameworkB',
          name: 'Framework B',
          areas: [area3],
        }),
      ]);

      // when
      const result = await findByTubeIds({ tubeIds: ['frameworkA', 'frameworkB'] });

      // then
      expect(result).to.deepEqualArray([
        new LearningContentDTO({ id: 'frameworkA', name: 'Framework A', areas: [area1, area2] }),
        new LearningContentDTO({ id: 'frameworkB', name: 'Framework B', areas: [area3] }),
      ]);
    });
  });
});
