import * as url from 'node:url';

import Joi from 'joi';

import {
  commaSeparatedNumberParser,
  commaSeparatedStringParser,
  csvFileParser,
  csvFileStreamer,
  isoDateParser,
} from '../../../../../src/shared/application/scripts/parsers.js';

import { catchErr } from '../../../../tooling/test-utils/error.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

describe('Shared | Unit | Application | Parsers', function () {
  describe('csvFileParser', function () {
    it('parses a CSV with the given schema', async function () {
      // given
      const validFilePath = `${__dirname}files/valid.csv`;
      const columnSchemas = [
        { name: 'foo', schema: Joi.string() },
        { name: 'bar', schema: Joi.string().email() },
      ];

      // when
      const parser = csvFileParser(columnSchemas);
      const result = await parser(validFilePath);

      // then
      expect(result).to.deep.equal([
        { foo: 'hello', bar: 'world@email.com' },
        { foo: 'baz', bar: 'someone@example.net' },
        { foo: 'bob', bar: 'john@example.net' },
      ]);
    });

    it('throws an error when CSV is invalid', async function () {
      // given
      const invalidFilePath = `${__dirname}files/invalid.csv`;
      const columnSchemas = [
        { name: 'foo', schema: Joi.string() },
        { name: 'bar', schema: Joi.string().email() },
      ];

      // when
      const parser = csvFileParser(columnSchemas);
      const error = await catchErr(parser)(invalidFilePath);

      // then
      expect(error).to.be.instanceOf(Joi.ValidationError);
      expect(error.message).to.equal('BOOMEMAIL "value" must be a valid email');
    });
  });

  describe('csvFileStreamer', function () {
    it('streams a CSV by row with the given schema', async function () {
      // given
      const validFilePath = `${__dirname}files/valid.csv`;
      const columnSchemas = [
        { name: 'foo', schema: Joi.string() },
        { name: 'bar', schema: Joi.string().email() },
      ];

      // when
      const streamer = await csvFileStreamer(columnSchemas);
      const fileStream = await streamer(validFilePath);

      const chunks = [];
      await fileStream((chunk) => {
        chunks.push(chunk);
      });

      // then
      expect(chunks).to.deep.equal([
        [{ foo: 'hello', bar: 'world@email.com' }],
        [{ foo: 'baz', bar: 'someone@example.net' }],
        [{ foo: 'bob', bar: 'john@example.net' }],
      ]);
    });

    it('streams a CSV by chunk with the given schema', async function () {
      // given
      const validFilePath = `${__dirname}files/valid.csv`;
      const columnSchemas = [
        { name: 'foo', schema: Joi.string() },
        { name: 'bar', schema: Joi.string().email() },
      ];

      // when
      const chunkSize = 2;
      const streamer = await csvFileStreamer(columnSchemas);
      const fileStream = await streamer(validFilePath);

      const chunks = [];
      await fileStream((chunk) => {
        chunks.push(chunk);
      }, chunkSize);

      // then
      expect(chunks).to.deep.equal([
        [
          { foo: 'hello', bar: 'world@email.com' },
          { foo: 'baz', bar: 'someone@example.net' },
        ],
        [{ foo: 'bob', bar: 'john@example.net' }],
      ]);
    });

    it('throws an error when CSV is invalid', async function () {
      // given
      const invalidFilePath = `${__dirname}files/invalid.csv`;
      const columnSchemas = [
        { name: 'foo', schema: Joi.string() },
        { name: 'bar', schema: Joi.string().email() },
      ];

      // when
      const streamer = await csvFileStreamer(columnSchemas);
      const fileStream = await streamer(invalidFilePath);

      const chunks = [];
      const error = await catchErr(fileStream)((chunk) => {
        chunks.push(chunk);
      });

      // then
      expect(error).to.be.instanceOf(Joi.ValidationError);
      expect(error.message).to.equal('"bar" must be a valid email');
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

  describe('isoDateParser', function () {
    it('parses a valid date string in YYYY-MM-DD format', function () {
      // given
      const input = '2023-12-25';

      // when
      const parser = isoDateParser();
      const result = parser(input);

      // then
      expect(result).to.be.instanceOf(Date);
      expect(result.toISOString().startsWith('2023-12-25')).to.be.true;
    });

    it('throws an error for an invalid date format', async function () {
      // given
      const input = '12-25-2023';

      // when
      const parser = isoDateParser();
      const error = await catchErr(parser)(input);

      // then
      expect(error).to.be.instanceOf(Error);
      expect(error.message).to.equal('Invalid date format. Expected "YYYY-MM-DD".');
    });

    it('throws an error for non-date strings', async function () {
      // given
      const input = 'not-a-date';

      // when
      const parser = isoDateParser();
      const error = await catchErr(parser)(input);

      // then
      expect(error).to.be.instanceOf(Error);
      expect(error.message).to.equal('Invalid date format. Expected "YYYY-MM-DD".');
    });
  });
});
