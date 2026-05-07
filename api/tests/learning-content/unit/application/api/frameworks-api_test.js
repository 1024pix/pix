import sinon from 'sinon';

import { findByIds } from '../../../../../src/learning-content/application/api/frameworks-api.js';
import { FrameworkDTO } from '../../../../../src/learning-content/application/api/models/FrameworkDTO.js';
import { usecases } from '../../../../../src/learning-content/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('LearningContent | Unit | Application | Api | frameworks', function () {
  describe('#findByIds', function () {
    let findFrameworksByIds;

    beforeEach(function () {
      findFrameworksByIds = sinon.stub(usecases, 'findFrameworksByIds');
    });

    it('returns an empty array when ids is empty', async function () {
      // given
      const ids = [];

      // when
      const result = await findByIds({ ids });

      // then
      expect(result).to.deepEqualArray([]);
    });

    it('returns a list of FrameworkDTO', async function () {
      // given
      findFrameworksByIds.resolves([
        domainBuilder.learningContent.buildFramework({
          id: 'frameworkA',
          name: 'Framework A',
        }),
        domainBuilder.learningContent.buildFramework({
          id: 'frameworkB',
          name: 'Framework B',
        }),
      ]);

      // when
      const result = await findByIds({ ids: ['frameworkA', 'frameworkB'] });

      // then
      expect(result).to.deepEqualArray([
        new FrameworkDTO({ id: 'frameworkA', name: 'Framework A' }),
        new FrameworkDTO({ id: 'frameworkB', name: 'Framework B' }),
      ]);
    });
  });
});
