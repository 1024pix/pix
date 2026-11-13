import { expect } from 'chai';

import { Embed } from '../../../../../../src/devcomp/domain/models/element/Embed.js';

describe('Unit | Devcomp | Domain | Models | Element | Embed', function () {
  describe('#constructor', function () {
    it('should create an embed and keep attributes', function () {
      // given
      const props = {
        id: 'id',
        isCompletionRequired: false,
        title: 'title',
        url: 'https://example.org',
        instruction: '<p>instruction</p>',
        height: 150,
        solution: 'solution 1',
      };

      // when
      const embed = new Embed(props);

      // then
      expect(embed.id).to.equal('id');
      expect(embed.type).to.equal('embed');
      expect(embed.isCompletionRequired).to.equal(false);
      expect(embed.title).to.equal('title');
      expect(embed.url).to.equal('https://example.org');
      expect(embed.instruction).to.equal('<p>instruction</p>');
      expect(embed.height).to.equal(150);
      expect(embed.solution).to.equal('solution 1');
    });

    describe('isAnswerable', function () {
      it('should be false when isCompletionRequired is false', function () {
        // given
        const props = {
          id: 'id',
          title: 'title',
          url: 'https://example.org',
          isCompletionRequired: false,
          height: 150,
        };

        // when
        const embed = new Embed(props);

        // then
        expect(embed.isAnswerable).to.equal(false);
      });

      it('should be true when isCompletionRequired is true', function () {
        // given
        const props = {
          id: 'id',
          title: 'title',
          url: 'https://example.org',
          isCompletionRequired: true,
          height: 150,
        };

        // when
        const embed = new Embed(props);

        // then
        expect(embed.isAnswerable).to.equal(true);
      });
    });
  });
});
