import { Video } from '../../../../../../src/devcomp/domain/models/element/Video.js';
import { DomainError } from '../../../../../../src/shared/domain/errors.js';

import { catchErrSync } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Devcomp | Domain | Models | Element | Video', function () {
  describe('#constructor', function () {
    it('should create a video and keep attributes', function () {
      // when
      const video = new Video({
        id: 'id',
        title: 'title',
        url: 'https://assets.pix.org/modules/video.mp4',
        subtitles: 'https://assets.pix.org/modules/video-poster.vtt',
        transcription: 'transcription',
        poster: 'https://assets.pix.org/modules/video-poster.jpg',
      });

      // then
      expect(video.id).to.equal('id');
      expect(video.type).to.equal('video');
      expect(video.title).to.equal('title');
      expect(video.url).to.equal('https://assets.pix.org/modules/video.mp4');
      expect(video.subtitles).to.equal('https://assets.pix.org/modules/video-poster.vtt');
      expect(video.transcription).to.equal('transcription');
      expect(video.poster).to.equal('https://assets.pix.org/modules/video-poster.jpg');
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

  describe('A video without a valid url', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(
        () => new Video({ id: 'id', title: 'title', url: 'url', subtitles: '', transcription: '' }),
      )();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The URL must be a valid URL for a video');
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

  describe('A video without a valid format url for subtitles', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(
        () =>
          new Video({
            id: 'id',
            title: 'title',
            url: 'https://assets.pix.org/modules/video.mp4',
            transcription: '',
            subtitles: 'subtitles',
          }),
      )();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The subtitles must be a valid URL for a video');
    });
  });

  describe('A video without a transcription', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(
        () =>
          new Video({
            id: 'id',
            title: 'title',
            url: 'https://assets.pix.org/video.mp4',
            subtitles: 'https://assets.pix.org/video.vtt',
          }),
      )();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The transcription is required for a video');
    });
  });

  describe('When video URL is not from assets.pix.org', function () {
    it('should throw an error', function () {
      // given & when
      const error = catchErrSync(
        () =>
          new Video({
            id: 'id',
            title: 'title',
            url: 'https://example.com/modules/video.mp4',
            subtitles: 'https://assets.pix.org/modules/video-poster.vtt',
            transcription: 'transcription',
            poster: 'https://assets.pix.org/modules/video-poster.jpg',
          }),
      )();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The video URL must be from "assets.pix.org"');
    });
  });

  describe('When video subtitle URL is not from assets.pix.org', function () {
    it('should throw an error', function () {
      // given & when
      const error = catchErrSync(
        () =>
          new Video({
            id: 'id',
            title: 'title',
            url: 'https://assets.pix.org/modules/video-poster.mp4',
            subtitles: 'https://example.com/modules/video-poster.vtt',
            transcription: 'transcription',
            poster: 'https://assets.pix.org/modules/video-poster.jpg',
          }),
      )();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The subtitles URL must be from "assets.pix.org"');
    });
  });
});
