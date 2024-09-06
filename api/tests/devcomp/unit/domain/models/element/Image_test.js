import { Image } from '../../../../../../src/devcomp/domain/models/element/Image.js';
import { DomainError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync, expect } from '../../../../../test-helper.js';

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
      // when
      const error = catchErrSync(() => new Image({}))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The id is required for an element');
    });
  });

  describe('An image without url', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new Image({ id: 'id' }))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The URL is required for an image');
    });
  });

  describe('An image without alt', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new Image({ id: 'id', url: 'url' }))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The alt text is required for an image');
    });
  });

  describe('An image without an alternative text', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new Image({ id: 'id', url: 'url', alt: 'alt' }))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The alternative text is required for an image');
    });
  });
});
