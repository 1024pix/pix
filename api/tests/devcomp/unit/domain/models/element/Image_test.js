import { Image } from '../../../../../../src/devcomp/domain/models/element/Image.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | Element | Image', function () {
  describe('#constructor', function () {
    it('should create an image and keep attributes', function () {
      // when
      const image = new Image({ id: 'id', url: 'url', alt: 'alt', alternativeText: 'alternativeText' });

      // then
      expect(image.id).to.equal('id');
      expect(image.url).to.equal('url');
      expect(image.alt).to.equal('alt');
      expect(image.alternativeText).to.equal('alternativeText');
      expect(image.type).to.equal('image');
    });
  });

  describe('An image without id', function () {
    it('should throw an error', function () {
      expect(() => new Image({})).to.throw('The id is required for an element');
    });
  });

  describe('An image without url', function () {
    it('should throw an error', function () {
      expect(() => new Image({ id: 'id' })).to.throw('The URL is required for an image');
    });
  });

  describe('An image without alt', function () {
    it('should throw an error', function () {
      expect(() => new Image({ id: 'id', url: 'url' })).to.throw('The alt text is required for an image');
    });
  });

  describe('An image without an alternative Instruction', function () {
    it('should throw an error', function () {
      expect(() => new Image({ id: 'id', url: 'url', alt: 'alt' })).to.throw(
        'The alternative instruction is required for an image',
      );
    });
  });
});
