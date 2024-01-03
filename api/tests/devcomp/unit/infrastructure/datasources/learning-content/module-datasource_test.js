import moduleDatasource from '../../../../../../src/devcomp/infrastructure/datasources/learning-content/module-datasource.js';
import { expect } from '../../../../../test-helper.js';
import { LearningContentResourceNotFound } from '../../../../../../src/shared/infrastructure/datasources/learning-content/LearningContentResourceNotFound.js';
import Joi from 'joi';

describe('Unit | Infrastructure | Datasources | Learning Content | ModuleDatasource', function () {
  describe('#getBySlug', function () {
    describe('when exists', function () {
      let moduleSchema;

      before(function () {
        const uuidSchema = Joi.string().guid().required();

        const transitionTextSchema = Joi.object({
          grainId: uuidSchema,
          content: Joi.string().required(),
        }).required();

        const textElementSchema = Joi.object({
          id: uuidSchema,
          type: Joi.string().valid('text').required(),
          content: Joi.string().required(),
        }).required();

        const imageElementSchema = Joi.object({
          id: uuidSchema,
          type: Joi.string().valid('image').required(),
          url: Joi.string().required(),
          alt: Joi.string().required(),
          alternativeText: Joi.string().required(),
        }).required();

        const videoElementSchema = Joi.object({
          id: uuidSchema,
          type: Joi.string().valid('video').required(),
          title: Joi.string().required(),
          url: Joi.string().required(),
          subtitles: Joi.string().required(),
          transcription: Joi.string().required(),
          alternativeText: Joi.string().required(),
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

        const blockInputSchema = Joi.object({
          input: Joi.string().required(),
          type: Joi.string().valid('input').required(),
          inputType: Joi.string().valid('text', 'number').required(),
          size: Joi.number().positive().required(),
          display: Joi.string().valid('inline', 'block').required(),
          placeholder: Joi.string().allow('').required(),
          ariaLabel: Joi.string().required(),
          defaultValue: Joi.string().allow('').required(),
          tolerances: Joi.array()
            .unique()
            .items(Joi.string().valid('t1', 't2', 't3'))
            .required(),
          solutions: Joi.array().items(Joi.string().required()).required(),
        }).required();

        const blockSelectSchema = Joi.object({
          input: Joi.string().required(),
          type: Joi.string().valid('select').required(),
          display: Joi.string().valid('inline', 'block').required(),
          placeholder: Joi.string().allow('').required(),
          ariaLabel: Joi.string().required(),
          defaultValue: Joi.string().allow('').required(),
          tolerances: Joi.array().empty().required(),
          options: Joi.array()
            .items(
              Joi.object({
                id: Joi.string().required(),
                content: Joi.string().required(),
              }),
            )
            .required(),
          solutions: Joi.array().items(Joi.string().required()).required(),
        }).required();

        const blockTextSchema = Joi.object({
          type: Joi.string().valid('text').required(),
          content: Joi.string().required(),
        }).required();

        const qrocmElementSchema = Joi.object({
          id: uuidSchema,
          type: Joi.string().valid('qrocm').required(),
          instruction: Joi.string().required(),
          proposals: Joi.array()
            .items(Joi.alternatives().try(blockTextSchema, blockInputSchema, blockSelectSchema))
            .required(),
          feedbacks: Joi.object({
            valid: Joi.string().required(),
            invalid: Joi.string().required(),
          }).required(),
        });

        moduleSchema = Joi.object({
          id: uuidSchema,
          slug: Joi.string()
            .regex(/^[a-z0-9-]+$/)
            .required(),
          title: Joi.string().required(),
          transitionTexts: Joi.array().items(transitionTextSchema),
          grains: Joi.array()
            .items(
              Joi.object({
                id: uuidSchema,
                type: Joi.string().valid('lesson', 'activity').required(),
                title: Joi.string().required(),
                elements: Joi.array()
                  .items(
                    Joi.alternatives().try(
                      textElementSchema,
                      imageElementSchema,
                      qcuElementSchema,
                      qrocmElementSchema,
                      videoElementSchema,
                    ),
                  )
                  .required(),
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
