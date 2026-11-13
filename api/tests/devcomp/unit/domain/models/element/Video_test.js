import { expect } from 'chai';

import { Video } from '../../../../../../src/devcomp/domain/models/element/Video.js';

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
});
