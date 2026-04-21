import sinon from 'sinon';

import { SkillDTO } from '../../../../../src/learning-content/application/api/models/SkillDTO.js';
import * as skillsApi from '../../../../../src/learning-content/application/api/skills-api.js';
import { usecases } from '../../../../../src/learning-content/domain/usecases/index.js';

import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { preventStubsToBeCalledUnexpectedly } from '../../../../tooling/test-utils/error.js';

describe('LearningContent | Unit | Application | Api | skills', function () {
  describe('#findByIds', function () {
    let findByIdsStub;

    beforeEach(function () {
      findByIdsStub = sinon.stub(usecases, 'findSkillsByIds');
      preventStubsToBeCalledUnexpectedly([findByIdsStub]);
    });

    it('should return an empty array when skillIds given as param are empty or invalid', async function () {
      // given
      const emptySkillIds = [];
      const brokenSkillIds = null;

      // when
      const resultForEmpty = await skillsApi.findByIds({ ids: emptySkillIds });
      const resultForBroken = await skillsApi.findByIds({ ids: brokenSkillIds });

      // then
      expect(resultForEmpty).to.deepEqualArray([]);
      expect(resultForBroken).to.deepEqualArray([]);
    });

    it('should return skillDTOs created from skills returned by usecase', async function () {
      // given
      findByIdsStub.withArgs({ ids: ['acquisA', 'acquisB'] }).resolves([
        domainBuilder.buildSkill({
          id: 'acquisA',
          tubeId: 'tubeA',
          difficulty: 5,
        }),
        domainBuilder.buildSkill({
          id: 'acquisB',
          tubeId: 'tubeB',
          difficulty: 3,
        }),
      ]);

      // when
      const result = await skillsApi.findByIds({ ids: ['acquisA', 'acquisB'] });

      // then
      expect(result).to.deepEqualArray([
        new SkillDTO({ id: 'acquisA', difficulty: 5, tubeId: 'tubeA' }),
        new SkillDTO({ id: 'acquisB', difficulty: 3, tubeId: 'tubeB' }),
      ]);
    });
  });
});
