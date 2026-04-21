import {
  AudioPlayedEvent,
  AudioTranscriptionOpenedEvent,
  ShortVideoTranscriptionOpenedEvent,
} from '../../../../../../src/devcomp/domain/models/passage-events/events.js';

describe('Integration | Devcomp | Domain | Models | passage-events | events', function () {
  describe('#ShortVideoTranscriptionOpenedEvent', function () {
    it('should init and keep attributes', function () {
      // given
      const id = Symbol('id');
      const occurredAt = new Date();
      const createdAt = Symbol('date');
      const passageId = 1234;
      const sequenceNumber = 2;
      const elementId = 'f46f8a14-a4d2-400a-95a3-2c8033b30f4e';

      // when
      const event = new ShortVideoTranscriptionOpenedEvent({
        id,
        occurredAt,
        createdAt,
        passageId,
        sequenceNumber,
        elementId,
      });

      // then
      expect(event.id).to.equal(id);
      expect(event.type).to.equal('SHORT_VIDEO_TRANSCRIPTION_OPENED');
      expect(event.occurredAt).to.equal(occurredAt);
      expect(event.createdAt).to.equal(createdAt);
      expect(event.passageId).to.equal(passageId);
      expect(event.sequenceNumber).to.equal(sequenceNumber);
      expect(event.data).to.deep.equal({ elementId });
    });
  });
  describe('#AudioPlayedEvent', function () {
    it('should init and keep attributes', function () {
      // given
      const id = Symbol('id');
      const occurredAt = new Date();
      const createdAt = Symbol('date');
      const passageId = 1234;
      const sequenceNumber = 2;
      const elementId = '48fe5289-c2eb-46eb-b721-983ca8820be4';

      // when
      const event = new AudioPlayedEvent({
        id,
        occurredAt,
        createdAt,
        passageId,
        sequenceNumber,
        elementId,
      });

      // then
      expect(event.id).to.equal(id);
      expect(event.type).to.equal('AUDIO_PLAYED');
      expect(event.occurredAt).to.equal(occurredAt);
      expect(event.createdAt).to.equal(createdAt);
      expect(event.passageId).to.equal(passageId);
      expect(event.sequenceNumber).to.equal(sequenceNumber);
      expect(event.data).to.deep.equal({ elementId });
    });
  });

  describe('#AudioTranscriptionOpenedEvent', function () {
    it('should init and keep attributes', function () {
      // given
      const id = Symbol('id');
      const occurredAt = new Date();
      const createdAt = Symbol('date');
      const passageId = 1234;
      const sequenceNumber = 2;
      const elementId = '4de85234-eb12-48fc-8a9d-aae1897b136d';

      // when
      const event = new AudioTranscriptionOpenedEvent({
        id,
        occurredAt,
        createdAt,
        passageId,
        sequenceNumber,
        elementId,
      });

      // then
      expect(event.id).to.equal(id);
      expect(event.type).to.equal('AUDIO_TRANSCRIPTION_OPENED');
      expect(event.occurredAt).to.equal(occurredAt);
      expect(event.createdAt).to.equal(createdAt);
      expect(event.passageId).to.equal(passageId);
      expect(event.sequenceNumber).to.equal(sequenceNumber);
      expect(event.data).to.deep.equal({ elementId });
    });
  });
});
