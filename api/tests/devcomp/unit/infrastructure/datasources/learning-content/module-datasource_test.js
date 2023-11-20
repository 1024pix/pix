import moduleDatasource from '../../../../../../src/devcomp/infrastructure/datasources/learning-content/module-datasource.js';
import { expect } from '../../../../../test-helper.js';
import { LearningContentResourceNotFound } from '../../../../../../src/shared/infrastructure/datasources/learning-content/LearningContentResourceNotFound.js';
import Joi from 'joi';

describe('Unit | Infrastructure | Datasource | Learning Content | ModuleDatasource', function () {
  describe('#getBySlug', function () {
    describe('when exists', function () {
      let moduleSchema;

      before(function () {
        const uuidSchema = Joi.string().guid().required();

        const textElementSchema = Joi.object({
          id: uuidSchema,
          type: Joi.string().valid('text').required(),
          content: Joi.string().required(),
        }).required();

        const qcuElementSchema = Joi.object({
          id: uuidSchema,
          type: Joi.string().valid('qcu').required(),
          instruction: Joi.string().required(),
          proposals: Joi.array()
            .items({
              id: uuidSchema,
              content: Joi.string().required(),
            })
            .required(),
          feedbacks: Joi.object({
            valid: Joi.string().required(),
            invalid: Joi.string().required(),
          }).required(),
          solution: uuidSchema,
        }).required();

        moduleSchema = Joi.object({
          id: uuidSchema,
          slug: Joi.string()
            .regex(/^[a-z0-9-]+$/)
            .required(),
          title: Joi.string().required(),
          grains: Joi.array()
            .items(
              Joi.object({
                id: uuidSchema,
                type: Joi.string().valid('lesson', 'activity').required(),
                title: Joi.string().required(),
                elements: Joi.array().items(Joi.alternatives().try(textElementSchema, qcuElementSchema)).required(),
              }).required(),
            )
            .required(),
        }).required();
      });

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
