import moduleDatasource from '../../../../../../src/devcomp/infrastructure/datasources/learning-content/module-datasource.js';
import { LearningContentResourceNotFound } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { joiErrorParser } from './validation/joi-error-parser.js';
import { moduleSchema } from './validation/module-schema.js';

const modules = await moduleDatasource.list();

describe('Unit | Infrastructure | Datasources | Learning Content | ModuleDatasource', function () {
  describe('#getById', function () {
    describe('when exists', function () {
      it('should return something', async function () {
        // Given
        const id = 'f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d';
        const module = await moduleDatasource.getById(id);

        // When & then
        expect(module).to.exist;
      });
    });

    describe("when doesn't exist", function () {
      it('should throw an LearningContentResourceNotFound', async function () {
        // given
        const id = 'fake-uuid';

        // when & then
        await expect(moduleDatasource.getById(id)).to.have.been.rejectedWith(LearningContentResourceNotFound);
      });
    });
  });

  describe('#getBySlug', function () {
    describe('when exists', function () {
      it('should return something', async function () {
        // Given
        const slug = 'bien-ecrire-son-adresse-mail';
        const module = await moduleDatasource.getBySlug(slug);

        // When & then
        expect(module).to.exist;
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

  describe('#list', function () {
    describe('modules content', function () {
      // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
      // eslint-disable-next-line mocha/no-setup-in-describe
      modules.forEach((module) => {
        it(`module "${module.slug}" should contain a valid structure`, async function () {
          // We need to increase the timeout because the validation can be slow for large modules
          this.timeout(5000);
          try {
            await moduleSchema.validateAsync(module, { abortEarly: false });
          } catch (joiError) {
            const formattedError = joiErrorParser.format(joiError);

            expect(joiError).to.equal(undefined, formattedError);
          }
        });
      });
    });
  });
});
