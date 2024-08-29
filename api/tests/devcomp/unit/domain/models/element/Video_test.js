import { Video } from '../../../../../../src/devcomp/domain/models/element/Video.js';
import { DomainError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync, expect } from '../../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | Element | Video', function () {
  describe('#constructor', function () {
    it('should create a video and keep attributes', function () {
      // when
      const video = new Video({
        id: 'id',
        title: 'title',
        url: 'url',
        subtitles: 'subtitles',
        transcription: 'transcription',
        poster: 'https://example.org/modulix/video-poster.jpg',
      });

      // then
      expect(video.id).to.equal('id');
      expect(video.type).to.equal('video');
      expect(video.title).to.equal('title');
      expect(video.url).to.equal('url');
      expect(video.subtitles).to.equal('subtitles');
      expect(video.transcription).to.equal('transcription');
      expect(video.poster).to.equal('https://example.org/modulix/video-poster.jpg');
    });
  });

  describe('A video without id', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new Video({}))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The id is required for an element');
    });
  });

  describe('An video without a title', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new Video({ id: 'id' }))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The title is required for a video');
    });
  });

  describe('A video without a url', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new Video({ id: 'id', title: 'title' }))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The URL is required for a video');
    });
  });

  describe('A video without subtitles', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new Video({ id: 'id', title: 'title', url: 'url' }))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The subtitles are required for a video');
    });
  });

  describe('A video without a transcription', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new Video({ id: 'id', title: 'title', url: 'url', subtitles: 'subtitles' }))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The transcription is required for a video');
    });
  });
});
