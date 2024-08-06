import { catchErr, expect } from '../../../../../../../test-helper.js';
import { embedElementSchema } from './index.js';

describe('Unit | Infrastructure | Datasources | Learning Content | Module Datasource | Embed Element', function () {
  describe('when embed isCompletionRequired is false', function () {
    it('should pass if there is no solution key', async function () {
      // given
      const sampleEmbed = {
        id: '9f9df53e-5a23-40b4-8906-b649b915928c',
        type: 'embed',
        isCompletionRequired: false,
        title: 'My embed',
        url: 'https://examples.com/embed.html',
        instruction: 'Do something',
        height: 100,
      };

      // when
      await embedElementSchema.validateAsync(sampleEmbed);

      // then
      expect(true).to.be.true;
    });

    it('should throw if the solution key is present', async function () {
      // given
      const sampleEmbed = {
        id: '9f9df53e-5a23-40b4-8906-b649b915928c',
        type: 'embed',
        isCompletionRequired: false,
        title: 'My embed',
        url: 'https://examples.com/embed.html',
        instruction: 'Do something',
        solution: 'tata',
        height: 100,
      };

      // when
      const error = await catchErr(embedElementSchema.validateAsync, embedElementSchema)(sampleEmbed);

      // then
      expect(error).to.be.an.instanceOf(Error);
      expect(error.message).to.equal('"solution" is not allowed');
    });
  });

  describe('when embed isCompletionRequired is true', function () {
    it('should throw if there is no solution key', async function () {
      // given
      const sampleEmbed = {
        id: '9f9df53e-5a23-40b4-8906-b649b915928c',
        type: 'embed',
        isCompletionRequired: true,
        title: 'My embed',
        url: 'https://examples.com/embed.html',
        instruction: 'Do something',
        height: 100,
      };

      // when
      const error = await catchErr(embedElementSchema.validateAsync, embedElementSchema)(sampleEmbed);

      // then
      expect(error).to.be.an.instanceOf(Error);
      expect(error.message).to.equal('"solution" is required');
    });

    it('should pass if the solution key is present', async function () {
      // given
      const sampleEmbed = {
        id: '9f9df53e-5a23-40b4-8906-b649b915928c',
        type: 'embed',
        isCompletionRequired: true,
        title: 'My embed',
        url: 'https://examples.com/embed.html',
        instruction: 'Do something',
        solution: 'tata',
        height: 100,
      };

      // when
      await embedElementSchema.validateAsync(sampleEmbed);

      // then
      expect(true).to.be.true;
    });
  });
});
