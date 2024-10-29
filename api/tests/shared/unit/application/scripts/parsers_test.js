import * as url from 'node:url';

import Joi from 'joi';

import {
  commaSeparatedNumberParser,
  commaSeparatedStringParser,
  csvFileParser,
} from '../../../../../src/shared/application/scripts/parsers.js';
import { catchErr, expect } from '../../../../test-helper.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

describe('Shared | Unit | Application | Parsers', function () {
  describe('csvFileParser', function () {
    it('parses a CSV with the given schema', async function () {
      // given
      const validFilePath = `${__dirname}files/valid.csv`;
      const columnsSchema = [
        { name: 'foo', schema: Joi.string() },
        { name: 'bar', schema: Joi.string().email() },
      ];

      // when
      const parser = csvFileParser(columnsSchema);
      const result = await parser(validFilePath);

      // then
      expect(result).to.deep.equal([
        { foo: 'hello', bar: 'world@email.com' },
        { foo: 'baz', bar: 'boom@email.com' },
      ]);
    });

    it('throws an error when CSV is invalid', async function () {
      // given
      const invalidFilePath = `${__dirname}files/invalid.csv`;
      const columnsSchema = [
        { name: 'foo', schema: Joi.string() },
        { name: 'bar', schema: Joi.string().email() },
      ];

      // when
      const parser = csvFileParser(columnsSchema);
      const error = await catchErr(parser)(invalidFilePath);

      // then
      expect(error).to.be.instanceOf(Joi.ValidationError);
      expect(error.message).to.equal('"value" must be a valid email');
    });
  });

  describe('commaSeparatedStringParser', function () {
    it('parses a comma separated string and trim results', function () {
      // given
      const input = 'foo, bar ,baz';

      // when
      const parser = commaSeparatedStringParser();

      // then
      expect(parser(input)).to.deep.equal(['foo', 'bar', 'baz']);
    });

    it('parses a comma separated string with the given separator', function () {
      // given
      const input = 'foo|bar|baz';

      // when
      const parser = commaSeparatedStringParser('|');

      // then
      expect(parser(input)).to.deep.equal(['foo', 'bar', 'baz']);
    });
  });

  describe('commaSeparatedNumberParser', function () {
    it('parses a comma separated number and trim results', function () {
      // given
      const input = '1, 2 ,3';

      // when
      const parser = commaSeparatedNumberParser();

      // then
      expect(parser(input)).to.deep.equal([1, 2, 3]);
    });

    it('parses a comma separated number with the given separator', function () {
      // given
      const input = '1|2|3';

      // when
      const parser = commaSeparatedNumberParser('|');

      // then
      expect(parser(input)).to.deep.equal([1, 2, 3]);
    });

    it('throws an error if its not a full list of numbers', function () {
      // given
      const input = '1,foo,3';

      // when
      const parser = commaSeparatedNumberParser();

      // then
      expect(() => parser(input)).to.throw('"[1]" must be a number');
    });
  });
});
