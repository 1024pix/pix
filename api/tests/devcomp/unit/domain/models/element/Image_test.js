import { Image } from '../../../../../../src/devcomp/domain/models/element/Image.js';
import { DomainError } from '../../../../../../src/shared/domain/errors.js';
import { PixAssetImageInfos } from '../../../../../../src/shared/domain/models/PixAssetImageInfos.js';
import { catchErrSync } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Devcomp | Domain | Models | Element | Image', function () {
  describe('#constructor', function () {
    it('should create an image and keep attributes', function () {
      // when
      const image = new Image({
        id: 'id',
        url: 'https://assets.pix.org/modules/placeholder-details.svg',
        alt: 'alt',
        alternativeText: 'alternativeText',
        legend: 'legend',
        licence: 'licence',
        infos: new PixAssetImageInfos({ width: 400, height: 200 }),
      });

      // then
      expect(image.id).to.equal('id');
      expect(image.url).to.equal('https://assets.pix.org/modules/placeholder-details.svg');
      expect(image.alt).to.equal('alt');
      expect(image.alternativeText).to.equal('alternativeText');
      expect(image.legend).to.equal('legend');
      expect(image.licence).to.equal('licence');
      expect(image.type).to.equal('image');
      expect(image.infos).to.deep.equal({ width: 400, height: 200 });
    });

    describe('without infos', function () {
      it('should create an image and keep attributes', function () {
        // when
        const image = new Image({
          id: 'id',
          url: 'https://assets.pix.org/modules/placeholder-details.svg',
          alt: 'alt',
          alternativeText: 'alternativeText',
          legend: 'legend',
          licence: 'licence',
        });

        // then
        expect(image.id).to.equal('id');
        expect(image.url).to.equal('https://assets.pix.org/modules/placeholder-details.svg');
        expect(image.alt).to.equal('alt');
        expect(image.alternativeText).to.equal('alternativeText');
        expect(image.legend).to.equal('legend');
        expect(image.licence).to.equal('licence');
        expect(image.type).to.equal('image');
        expect(image.infos).to.be.undefined;
      });
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

  describe('An image with invalid url', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new Image({ id: 'id', url: 'url' }))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The URL must be a valid URL for an image');
    });
  });

  describe('An image without alt', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new Image({ id: 'id', url: 'https://images.pix.fr/coolcat.jpg' }))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The alt text is required for an image');
    });
  });

  describe('An image without an alternative text', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new Image({ id: 'id', url: 'https://images.pix.fr/coolcat.jpg', alt: 'alt' }))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The alternative text is required for an image');
    });
  });

  describe('When image URL is not from assets.pix.org', function () {
    it('should throw an error', function () {
      // given & when
      const error = catchErrSync(
        () =>
          new Image({
            id: 'id',
            url: 'https://images.pix.fr/coolcat.jpg',
            alt: 'alt',
            alternativeText: 'alternativeText',
            legend: 'legend',
            licence: 'licence',
          }),
      )();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The image URL must be from "assets.pix.org"');
    });
  });
});
