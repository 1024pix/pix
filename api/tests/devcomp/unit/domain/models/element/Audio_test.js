import { Audio } from '../../../../../../src/devcomp/domain/models/element/Audio.js';
import { DomainError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Devcomp | Domain | Models | Element | Audio', function () {
  describe('#constructor', function () {
    it('should create an audio and keep attributes', function () {
      // when
      const audio = new Audio({
        id: 'id',
        title: 'title',
        url: 'https://assets.pix.org/modules/audio.mp4',
        transcription: 'transcription',
      });

      // then
      expect(audio.id).to.equal('id');
      expect(audio.type).to.equal('audio');
      expect(audio.title).to.equal('title');
      expect(audio.url).to.equal('https://assets.pix.org/modules/audio.mp4');
      expect(audio.transcription).to.equal('transcription');
    });
  });

  describe('An audio without id', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new Audio({}))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The id is required for an element');
    });
  });

  describe('An audio without a title', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new Audio({ id: 'id' }))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The title is required for an audio');
    });
  });

  describe('An audio without a url', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new Audio({ id: 'id', title: 'title' }))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The URL is required for an audio');
    });
  });

  describe('An audio without a valid url', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new Audio({ id: 'id', title: 'title', url: 'url', transcription: '' }))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The URL must be a valid URL for an audio');
    });
  });

  describe('An audio without a transcription', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(
        () =>
          new Audio({
            id: 'id',
            title: 'title',
            url: 'https://assets.pix.org/audio.mp4',
          }),
      )();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The transcription is required for an audio');
    });
  });

  describe('When audio URL is not from assets.pix.org', function () {
    it('should throw an error', function () {
      // given & when
      const error = catchErrSync(
        () =>
          new Audio({
            id: 'id',
            title: 'title',
            url: 'https://example.com/modules/audio.mp4',
            transcription: 'transcription',
          }),
      )();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The audio URL must be from "assets.pix.org"');
    });
  });
});
