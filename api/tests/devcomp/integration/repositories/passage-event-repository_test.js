import sinon from 'sinon';

import { FlashcardsCardAutoAssessedEvent } from '../../../../src/devcomp/domain/models/passage-events/flashcard-events.js';
import { PassageStartedEvent } from '../../../../src/devcomp/domain/models/passage-events/passage-events.js';
import * as passageEventRepository from '../../../../src/devcomp/infrastructure/repositories/passage-event-repository.js';
import { DomainError } from '../../../../src/shared/domain/errors.js';

import { databaseBuilder, knex } from '../../../tooling/databases.js';
import { catchErr } from '../../../tooling/test-utils/error.js';

describe('Integration | DevComp | Repositories | PassageEventRepository', function () {
  describe('#record', function () {
    let clock;

    beforeEach(function () {
      clock = sinon.useFakeTimers(new Date('2023-12-31'), 'Date');
    });

    afterEach(function () {
      clock.restore();
    });

    it('should record a passage event', async function () {
      // given
      const passage = databaseBuilder.factory.buildPassage();
      await databaseBuilder.commit();
      const event = new PassageStartedEvent({
        occurredAt: new Date('2019-04-28'),
        passageId: passage.id,
        sequenceNumber: 1,
        contentHash: 'abcd1234',
      });

      // when
      await passageEventRepository.record(event);

      // then
      const recordedEvent = await knex('passage-events')
        .where({ type: 'PASSAGE_STARTED', passageId: passage.id, sequenceNumber: 1 })
        .first();
      expect(recordedEvent.data.contentHash).to.equal('abcd1234');
      expect(recordedEvent.occurredAt).to.deep.equal(new Date('2019-04-28'));
    });

    describe('when recording a passage event with an existing sequenceNumber', function () {
      it('should return a domain error', async function () {
        const passage = databaseBuilder.factory.buildPassage();
        databaseBuilder.factory.buildPassageEvent({
          passageId: passage.id,
          sequenceNumber: 1,
        });
        await databaseBuilder.commit();

        const event = new PassageStartedEvent({
          occurredAt: new Date('2019-04-28'),
          passageId: passage.id,
          sequenceNumber: 1,
          contentHash: 'abcd1234',
        });

        // when
        const error = await catchErr(passageEventRepository.record)(event);

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.deep.equal('There is already an existing event for this passageId and sequenceNumber');
      });
    });
  });

  describe('#getAllByPassageId', function () {
    it('should get all passage events according to provided passage-id', async function () {
      // given
      const passage = databaseBuilder.factory.buildPassage();
      const otherPassage = databaseBuilder.factory.buildPassage();
      const event1 = databaseBuilder.factory.buildPassageEvent({
        data: { contentHash: 'version' },
        passageId: passage.id,
        sequenceNumber: 2,
        type: 'PASSAGE_STARTED',
      });
      const event2 = databaseBuilder.factory.buildPassageEvent({
        data: {
          autoAssessment: 'yes',
          cardId: '3b9d1d5c-0441-48b6-b3f7-36de4e975715',
          elementId: 'c4981cba-b7c6-44de-8bc6-86d3465ecc70',
        },
        passageId: passage.id,
        sequenceNumber: 1,
        type: 'FLASHCARDS_CARD_AUTO_ASSESSED',
      });
      databaseBuilder.factory.buildPassageEvent({
        passageId: otherPassage.id,
        sequenceNumber: 2,
      });
      await databaseBuilder.commit();

      // when
      const results = await passageEventRepository.getAllByPassageId({ passageId: passage.id });

      // then
      expect(results).to.have.lengthOf(2);
      expect(results[0]).to.be.instanceOf(FlashcardsCardAutoAssessedEvent);
      expect(results[0].id).to.equal(event2.id);
      expect(results[0].sequenceNumber).to.equal(1);
      expect(results[1]).to.be.instanceOf(PassageStartedEvent);
      expect(results[1].id).to.equal(event1.id);
      expect(results[1].sequenceNumber).to.equal(2);
    });
  });
});
