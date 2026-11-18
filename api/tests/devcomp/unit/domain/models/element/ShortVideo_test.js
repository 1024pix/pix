import { expect } from 'chai';

import { ShortVideo } from '../../../../../../src/devcomp/domain/models/element/ShortVideo.js';

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
});
