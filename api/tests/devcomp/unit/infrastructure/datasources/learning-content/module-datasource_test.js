import moduleDatasource from '../../../../../../src/devcomp/infrastructure/datasources/learning-content/module-datasource.js';
import { expect } from '../../../../../test-helper.js';
import { LearningContentResourceNotFound } from '../../../../../../src/shared/infrastructure/datasources/learning-content/LearningContentResourceNotFound.js';
import { moduleSchema } from './validation/module.js';

describe('Unit | Infrastructure | Datasources | Learning Content | ModuleDatasource', function () {
  describe('#getBySlug', function () {
    describe('when exists', function () {
      it('should contain a valid structure', async function () {
        // Given
        const slug = 'bien-ecrire-son-adresse-mail';
        const module = await moduleDatasource.getBySlug(slug);

        // When
        const result = moduleSchema.validate(module);

        // Then
        expect(result.error).to.equal(undefined, result.error?.details.map((error) => error.message).join('. '));
      });
    });

    describe("when doesn't exist", function () {
      it('should throw an LearningContentResourceNotFound', async function () {
        // given
        const slug = 'dresser-un-pokemon';

        // when & then
        await expect(moduleDatasource.getBySlug(slug)).to.have.been.rejectedWith(LearningContentResourceNotFound);
      });
    });
  });
});
