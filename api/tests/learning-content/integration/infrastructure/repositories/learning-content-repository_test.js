import { LearningContentRepository } from '../../../../../src/learning-content/infrastructure/repositories/learning-content-repository.js';
import { expect } from '../../../../test-helper.js';

describe('Learning Content | Integration | Repositories | Learning Content', function () {
  describe('#save', function () {
    describe('when dtos are nullish', function () {
      it('should do nothing', async function () {
        // given
        const repository = new LearningContentRepository({ tableName: 'TEST' });
        const dtos = undefined;

        // when
        const result = await repository.save(dtos);

        // then
        expect(result).to.be.undefined;
      });
    });
  });
});
