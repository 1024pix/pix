import { Video } from '../../../../../../src/devcomp/domain/models/element/Video.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | Element | Video', function () {
  describe('#constructor', function () {
    it('should create a video and keep attributes', function () {
      // when
      const image = new Video({
        id: 'id',
        title: 'title',
        url: 'url',
        subtitles: 'subtitles',
        transcription: 'transcription',
        alternativeText: 'alternativeText',
      });

      // then
      expect(image.id).to.equal('id');
      expect(image.type).to.equal('video');
      expect(image.title).to.equal('title');
      expect(image.url).to.equal('url');
      expect(image.subtitles).to.equal('subtitles');
      expect(image.transcription).to.equal('transcription');
      expect(image.alternativeText).to.equal('alternativeText');
    });
  });

  describe('An video without id', function () {
    it('should throw an error', function () {
      expect(() => new Video({})).to.throw("L'id est obligatoire pour un élément");
    });
  });

  describe('An video without a title', function () {
    it('should throw an error', function () {
      expect(() => new Video({ id: 'id' })).to.throw("L'URL est obligatoire pour un video");
    });
  });

  describe('An image without a url', function () {
    it('should throw an error', function () {
      expect(() => new Video({ id: 'id', title: 'title' })).to.throw("L'URL est obligatoire pour un video");
    });
  });

  describe('A video without subtitles', function () {
    it('should throw an error', function () {
      expect(() => new Video({ id: 'id', title: 'title', url: 'url' })).to.throw(
        'Les sous-titres sont obligatoire pour un video',
      );
    });
  });

  describe('A video without a transcription', function () {
    it('should throw an error', function () {
      expect(() => new Video({ id: 'id', title: 'title', url: 'url', subtitles: 'subtitles' })).to.throw(
        'Les transcriptions sont obligatoire pour un video',
      );
    });
  });

  describe('A video without an alternative Text', function () {
    it('should throw an error', function () {
      expect(
        () =>
          new Video({ id: 'id', title: 'title', url: 'url', subtitles: 'subtitles', transcription: 'transcription' }),
      ).to.throw("L'instruction alternative est obligatoire pour un video");
    });
  });
});
