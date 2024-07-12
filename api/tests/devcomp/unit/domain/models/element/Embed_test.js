import { Embed } from '../../../../../../src/devcomp/domain/models/element/Embed.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | Element | Embed', function () {
  describe('#constructor', function () {
    it('should create an embed and keep attributes', function () {
      // given
      const props = {
        id: 'id',
        isCompletionRequired: false,
        title: 'title',
        url: 'https://embed.com',
        instruction: '<p>instruction</p>',
        height: 150,
      };

      // when
      const embed = new Embed(props);

      // then
      expect(embed.id).to.equal('id');
      expect(embed.type).to.equal('embed');
      expect(embed.isCompletionRequired).to.equal(false);
      expect(embed.title).to.equal('title');
      expect(embed.url).to.equal('https://embed.com');
      expect(embed.instruction).to.equal('<p>instruction</p>');
      expect(embed.height).to.equal(150);
    });

    describe('errors', function () {
      describe('An embed without an id', function () {
        it('should throw an error', function () {
          expect(() => new Embed({})).to.throw('The id is required for an element');
        });
      });

      describe('An embed without the isCompletionRequired attribute', function () {
        it('should throw an error', function () {
          expect(() => new Embed({ id: 'id' })).to.throw('The isCompletionRequired attribute is required for an embed');
        });
      });

      describe('An embed without a title', function () {
        it('should throw an error', function () {
          expect(() => new Embed({ id: 'id', isCompletionRequired: false })).to.throw(
            'The title is required for an embed',
          );
        });
      });

      describe('An embed without an url', function () {
        it('should throw an error', function () {
          expect(() => new Embed({ id: 'id', isCompletionRequired: false, title: 'title' })).to.throw(
            'The url is required for an embed',
          );
        });
      });

      describe('An embed without a height', function () {
        it('should throw an error', function () {
          expect(
            () => new Embed({ id: 'id', isCompletionRequired: false, title: 'title', url: 'https://embed.com' }),
          ).to.throw('The height is required for an embed');
        });
      });
    });
  });
});
