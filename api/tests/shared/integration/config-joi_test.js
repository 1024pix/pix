import { expect } from 'chai';

import Joi from '../../../config/config-joi.js';

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

  describe('#duration', function () {
    beforeEach(function () {
      schema = Joi.object({
        MADDO: Joi.boolean().optional().default(false),
        TEST: Joi.string().duration().requiredForApi(),
      });
    });

    ['100ms', '5m', '1 h', '100', '0'].forEach((value) => {
      describe(`when value is "${value}"`, function () {
        it('should not return an error', function () {
          // given
          const config = { TEST: value };

          // when
          const { error } = schema.validate(config);

          // then
          expect(error).to.be.undefined;
        });
      });
    });

    ['abc', '10x', '-1s', ''].forEach((value) => {
      describe(`when value is "${value}"`, function () {
        it('should return an error', function () {
          // given
          const config = { TEST: value };

          // when
          const { error } = schema.validate(config);

          // then
          expect(error).not.to.be.undefined;
        });
      });
    });

    it('should explain the expected format', function () {
      // given
      const config = { TEST: 'abc' };

      // when
      const { error } = schema.validate(config);

      // then
      expect(error.message).to.equal('"TEST" must be a duration readable by ms, such as "100ms" or "5m"');
    });

    it('should keep the other rules of the extension', function () {
      // given
      const config = { MADDO: 'false' };

      // when
      const { error } = schema.validate(config);

      // then
      expect(error.message).to.equal('"TEST" is required');
    });
  });
});
