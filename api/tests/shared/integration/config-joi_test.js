import Joi from '../../../src/shared/config-joi.js';

describe('Shared | Integration | Config joi', function () {
  let schema;

  describe('#requiredForApi', function () {
    beforeEach(function () {
      schema = Joi.object({
        MADDO: Joi.boolean().optional().default(false),
        TEST: Joi.string().requiredForApi(),
      });
    });

    describe('when MADDO=false', function () {
      describe('when value is undefined', function () {
        it('should return an error', function () {
          // given
          const config = { MADDO: 'false' };

          // when
          const { error } = schema.validate(config);

          // then
          expect(error).not.to.be.undefined;
        });
      });

      describe('when value is defined', function () {
        it('should not return an error', function () {
          // given
          const config = { MADDO: 'false', TEST: 'TEST' };

          // when
          const { error } = schema.validate(config);

          // then
          expect(error).to.be.undefined;
        });
      });
    });

    describe('when MADDO=true', function () {
      describe('when value is undefined', function () {
        it('should not return an error', function () {
          // given
          const config = { MADDO: 'true' };

          // when
          const { error } = schema.validate(config);

          // then
          expect(error).to.be.undefined;
        });
      });

      describe('when value is defined', function () {
        it('should not return an error', function () {
          // given
          const config = { MADDO: 'true', TEST: 'TEST' };

          // when
          const { error } = schema.validate(config);

          // then
          expect(error).to.be.undefined;
        });
      });
    });
  });

  describe('#requiredForMaddo', function () {
    beforeEach(function () {
      schema = Joi.object({
        MADDO: Joi.boolean().optional().default(false),
        TEST: Joi.string().requiredForMaddo(),
      });
    });

    describe('when MADDO=false', function () {
      describe('when value is undefined', function () {
        it('should not return an error', function () {
          // given
          const config = { MADDO: 'false' };

          // when
          const { error } = schema.validate(config);

          // then
          expect(error).to.be.undefined;
        });
      });

      describe('when value is defined', function () {
        it('should not return an error', function () {
          // given
          const config = { MADDO: 'false', TEST: 'TEST' };

          // when
          const { error } = schema.validate(config);

          // then
          expect(error).to.be.undefined;
        });
      });
    });

    describe('when MADDO=true', function () {
      describe('when value is undefined', function () {
        it('should return an error', function () {
          // given
          const config = { MADDO: 'true' };

          // when
          const { error } = schema.validate(config);

          // then
          expect(error).not.to.be.undefined;
        });
      });

      describe('when value is defined', function () {
        it('should not return an error', function () {
          // given
          const config = { MADDO: 'true', TEST: 'TEST' };

          // when
          const { error } = schema.validate(config);

          // then
          expect(error).to.be.undefined;
        });
      });
    });
  });
});
