import { expect } from 'chai';

import { Audio } from '../../../../../../src/devcomp/domain/models/element/Audio.js';

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
});
