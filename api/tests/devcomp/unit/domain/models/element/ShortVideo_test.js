import { ShortVideo } from '../../../../../../src/devcomp/domain/models/element/ShortVideo.js';
import { DomainError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Devcomp | Domain | Models | Element | ShortVideo', function () {
  describe('#constructor', function () {
    it('should create a short video and keep attributes', function () {
      // when
      const shortVideo = new ShortVideo({
        id: 'id',
        title: 'title',
        url: 'https://assets.pix.org/modules/video.mp4',
        transcription: 'Je clique sur le bouton droit de la souris.',
      });

      // then
      expect(shortVideo.id).to.equal('id');
      expect(shortVideo.type).to.equal('short-video');
      expect(shortVideo.title).to.equal('title');
      expect(shortVideo.url).to.equal('https://assets.pix.org/modules/video.mp4');
      expect(shortVideo.transcription).to.equal('Je clique sur le bouton droit de la souris.');
    });
  });

  describe('A short-video without id', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new ShortVideo({}))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The id is required for an element');
    });
  });

  describe('An short video without a title', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new ShortVideo({ id: 'id' }))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The title is required for a short video');
    });
  });

  describe('A short video without a url', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new ShortVideo({ id: 'id', title: 'title' }))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The URL is required for a short video');
    });
  });

  describe('A short video without a valid url', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(
        () => new ShortVideo({ id: 'id', title: 'title', url: 'url', transcription: 'Je clique' }),
      )();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The URL must be a valid URL for a short video');
    });
  });

  describe('When short video URL is not from assets.pix.org', function () {
    it('should throw an error', function () {
      // given & when
      const error = catchErrSync(
        () =>
          new ShortVideo({
            id: 'id',
            title: 'title',
            url: 'https://example.com/modules/video.mp4',
            transcription: 'Je clique',
          }),
      )();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The short video URL must be from "assets.pix.org"');
    });
  });
});
