import {
  CustomDraftRetriedEvent,
  CustomRetriedEvent,
  EmbedAnsweredEvent,
  EmbedRetriedEvent,
  QCMAnsweredEvent,
  QCMDeclarativeAnsweredEvent,
  QCMRetriedEvent,
  QCUAnsweredEvent,
  QCUDeclarativeAnsweredEvent,
  QCUDiscoveryAnsweredEvent,
  QCURetriedEvent,
  QROCMAnsweredEvent,
  QROCMRetriedEvent,
} from '../../../../../../src/devcomp/domain/models/passage-events/answerable-element-events.js';
import { DomainError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { catchErrSync } from '../../../../../tooling/test-utils/error.js';

describe('Integration | Devcomp | Domain | Models | passage-events | answerable-element-events', function () {
  describe('#CustomDraftRetriedEvent', function () {
    it('should init and keep attributes', function () {
      // given
      const id = Symbol('id');
      const occurredAt = new Date();
      const createdAt = new Date();
      const passageId = 2;
      const sequenceNumber = 3;
      const elementId = '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095';

      // when
      const customDraftRetriedEvent = new CustomDraftRetriedEvent({
        id,
        occurredAt,
        createdAt,
        passageId,
        sequenceNumber,
        elementId,
      });

      // then
      expect(customDraftRetriedEvent.id).to.equal(id);
      expect(customDraftRetriedEvent.type).to.equal('CUSTOM_DRAFT_RETRIED');
      expect(customDraftRetriedEvent.occurredAt).to.equal(occurredAt);
      expect(customDraftRetriedEvent.createdAt).to.equal(createdAt);
      expect(customDraftRetriedEvent.passageId).to.equal(passageId);
      expect(customDraftRetriedEvent.sequenceNumber).to.equal(sequenceNumber);
      expect(customDraftRetriedEvent.data).to.deep.equal({ elementId });
    });
  });

  describe('#CustomRetriedEvent', function () {
    it('should init and keep attributes', function () {
      // given
      const id = Symbol('id');
      const occurredAt = new Date();
      const createdAt = new Date();
      const passageId = 2;
      const sequenceNumber = 3;
      const elementId = '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095';

      // when
      const customRetriedEvent = new CustomRetriedEvent({
        id,
        occurredAt,
        createdAt,
        passageId,
        sequenceNumber,
        elementId,
      });

      // then
      expect(customRetriedEvent.id).to.equal(id);
      expect(customRetriedEvent.type).to.equal('CUSTOM_RETRIED');
      expect(customRetriedEvent.occurredAt).to.equal(occurredAt);
      expect(customRetriedEvent.createdAt).to.equal(createdAt);
      expect(customRetriedEvent.passageId).to.equal(passageId);
      expect(customRetriedEvent.sequenceNumber).to.equal(sequenceNumber);
      expect(customRetriedEvent.data).to.deep.equal({ elementId });
    });
  });

  describe('#EmbedAnsweredEvent', function () {
    it('should init and keep attributes', function () {
      // given
      const id = Symbol('id');
      const occurredAt = new Date();
      const createdAt = new Date();
      const passageId = 2;
      const sequenceNumber = 3;
      const elementId = '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095';
      const answer = 'Courgette';
      const status = 'ok';

      // when
      const embedAnsweredEvent = new EmbedAnsweredEvent({
        id,
        occurredAt,
        createdAt,
        passageId,
        sequenceNumber,
        elementId,
        answer,
        status,
      });

      // then
      expect(embedAnsweredEvent.id).to.equal(id);
      expect(embedAnsweredEvent.type).to.equal('EMBED_ANSWERED');
      expect(embedAnsweredEvent.occurredAt).to.equal(occurredAt);
      expect(embedAnsweredEvent.createdAt).to.equal(createdAt);
      expect(embedAnsweredEvent.passageId).to.equal(passageId);
      expect(embedAnsweredEvent.sequenceNumber).to.equal(sequenceNumber);
      expect(embedAnsweredEvent.data).to.deep.equal({ elementId, answer, status });
    });
  });

  describe('#EmbedRetriedEvent', function () {
    it('should init and keep attributes', function () {
      // given
      const id = Symbol('id');
      const occurredAt = new Date();
      const createdAt = new Date();
      const passageId = 2;
      const sequenceNumber = 3;
      const elementId = '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095';

      // when
      const embedRetriedEvent = new EmbedRetriedEvent({
        id,
        occurredAt,
        createdAt,
        passageId,
        sequenceNumber,
        elementId,
      });

      // then
      expect(embedRetriedEvent.id).to.equal(id);
      expect(embedRetriedEvent.type).to.equal('EMBED_RETRIED');
      expect(embedRetriedEvent.occurredAt).to.equal(occurredAt);
      expect(embedRetriedEvent.createdAt).to.equal(createdAt);
      expect(embedRetriedEvent.passageId).to.equal(passageId);
      expect(embedRetriedEvent.sequenceNumber).to.equal(sequenceNumber);
      expect(embedRetriedEvent.data).to.deep.equal({ elementId });
    });
  });

  describe('#QCMAnsweredEvent', function () {
    it('should init and keep attributes', function () {
      // given
      const id = Symbol('id');
      const occurredAt = new Date();
      const createdAt = new Date();
      const passageId = 2;
      const sequenceNumber = 3;
      const elementId = '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095';
      const answer = ['2', '3', '4'];
      const status = 'ok';

      // when
      const qcmAnsweredEvent = new QCMAnsweredEvent({
        id,
        occurredAt,
        createdAt,
        passageId,
        sequenceNumber,
        elementId,
        answer,
        status,
      });

      // then
      expect(qcmAnsweredEvent.id).to.equal(id);
      expect(qcmAnsweredEvent.type).to.equal('QCM_ANSWERED');
      expect(qcmAnsweredEvent.occurredAt).to.equal(occurredAt);
      expect(qcmAnsweredEvent.createdAt).to.equal(createdAt);
      expect(qcmAnsweredEvent.passageId).to.equal(passageId);
      expect(qcmAnsweredEvent.sequenceNumber).to.equal(sequenceNumber);
      expect(qcmAnsweredEvent.data).to.deep.equal({ elementId, answer, status });
    });
  });

  describe('#QCUAnsweredEvent', function () {
    it('should init and keep attributes', function () {
      // given
      const id = Symbol('id');
      const occurredAt = new Date();
      const createdAt = new Date();
      const passageId = 2;
      const sequenceNumber = 3;
      const elementId = '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095';
      const answer = 'Poire';
      const status = 'ok';

      // when
      const qcuAnsweredEvent = new QCUAnsweredEvent({
        id,
        occurredAt,
        createdAt,
        passageId,
        sequenceNumber,
        elementId,
        answer,
        status,
      });

      // then
      expect(qcuAnsweredEvent.id).to.equal(id);
      expect(qcuAnsweredEvent.type).to.equal('QCU_ANSWERED');
      expect(qcuAnsweredEvent.occurredAt).to.equal(occurredAt);
      expect(qcuAnsweredEvent.createdAt).to.equal(createdAt);
      expect(qcuAnsweredEvent.passageId).to.equal(passageId);
      expect(qcuAnsweredEvent.sequenceNumber).to.equal(sequenceNumber);
      expect(qcuAnsweredEvent.data).to.deep.equal({ elementId, answer, status });
    });
  });

  describe('#QCURetriedEvent', function () {
    it('should init and keep attributes', function () {
      // given
      const id = Symbol('id');
      const occurredAt = new Date();
      const createdAt = new Date();
      const passageId = 2;
      const sequenceNumber = 3;
      const elementId = '05112f63-0b47-4774-b638-6669c4e3a26d';

      // when
      const qcuRetriedEvent = new QCURetriedEvent({
        id,
        occurredAt,
        createdAt,
        passageId,
        sequenceNumber,
        elementId,
      });

      // then
      expect(qcuRetriedEvent.id).to.equal(id);
      expect(qcuRetriedEvent.type).to.equal('QCU_RETRIED');
      expect(qcuRetriedEvent.occurredAt).to.equal(occurredAt);
      expect(qcuRetriedEvent.createdAt).to.equal(createdAt);
      expect(qcuRetriedEvent.passageId).to.equal(passageId);
      expect(qcuRetriedEvent.sequenceNumber).to.equal(sequenceNumber);
      expect(qcuRetriedEvent.data).to.deep.equal({ elementId });
    });
  });

  describe('#QCMRetriedEvent', function () {
    it('should init and keep attributes', function () {
      // given
      const id = Symbol('id');
      const occurredAt = new Date();
      const createdAt = new Date();
      const passageId = 2;
      const sequenceNumber = 3;
      const elementId = '05112f63-0b47-4774-b638-6669c4e3a26d';

      // when
      const qcmRetriedEvent = new QCMRetriedEvent({
        id,
        occurredAt,
        createdAt,
        passageId,
        sequenceNumber,
        elementId,
      });

      // then
      expect(qcmRetriedEvent.id).to.equal(id);
      expect(qcmRetriedEvent.type).to.equal('QCM_RETRIED');
      expect(qcmRetriedEvent.occurredAt).to.equal(occurredAt);
      expect(qcmRetriedEvent.createdAt).to.equal(createdAt);
      expect(qcmRetriedEvent.passageId).to.equal(passageId);
      expect(qcmRetriedEvent.sequenceNumber).to.equal(sequenceNumber);
      expect(qcmRetriedEvent.data).to.deep.equal({ elementId });
    });
  });

  describe('#QROCMRetriedEvent', function () {
    it('should init and keep attributes', function () {
      // given
      const id = Symbol('id');
      const occurredAt = new Date();
      const createdAt = new Date();
      const passageId = 2;
      const sequenceNumber = 3;
      const elementId = '05112f63-0b47-4774-b638-6669c4e3a26d';

      // when
      const qrocmRetriedEvent = new QROCMRetriedEvent({
        id,
        occurredAt,
        createdAt,
        passageId,
        sequenceNumber,
        elementId,
      });

      // then
      expect(qrocmRetriedEvent.id).to.equal(id);
      expect(qrocmRetriedEvent.type).to.equal('QROCM_RETRIED');
      expect(qrocmRetriedEvent.occurredAt).to.equal(occurredAt);
      expect(qrocmRetriedEvent.createdAt).to.equal(createdAt);
      expect(qrocmRetriedEvent.passageId).to.equal(passageId);
      expect(qrocmRetriedEvent.sequenceNumber).to.equal(sequenceNumber);
      expect(qrocmRetriedEvent.data).to.deep.equal({ elementId });
    });
  });

  describe('#QCUDeclarativeAnsweredEvent', function () {
    it('should init and keep attributes', function () {
      // given
      const id = Symbol('id');
      const occurredAt = new Date();
      const createdAt = new Date();
      const passageId = 2;
      const sequenceNumber = 3;
      const elementId = '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095';
      const answer = 'À chaque Noël';

      // when
      const qcuDeclarativeAnsweredEvent = new QCUDeclarativeAnsweredEvent({
        id,
        occurredAt,
        createdAt,
        passageId,
        sequenceNumber,
        elementId,
        answer,
      });

      // then
      expect(qcuDeclarativeAnsweredEvent.id).to.equal(id);
      expect(qcuDeclarativeAnsweredEvent.type).to.equal('QCU_DECLARATIVE_ANSWERED');
      expect(qcuDeclarativeAnsweredEvent.occurredAt).to.equal(occurredAt);
      expect(qcuDeclarativeAnsweredEvent.createdAt).to.equal(createdAt);
      expect(qcuDeclarativeAnsweredEvent.passageId).to.equal(passageId);
      expect(qcuDeclarativeAnsweredEvent.sequenceNumber).to.equal(sequenceNumber);
      expect(qcuDeclarativeAnsweredEvent.data).to.deep.equal({ elementId, answer });
    });

    describe('when answer is not given', function () {
      it('should throw an error', function () {
        // given
        const id = Symbol('id');
        const occurredAt = new Date();
        const createdAt = new Date();
        const passageId = 2;
        const sequenceNumber = 3;
        const elementId = '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095';
        const answer = undefined;

        // when
        const error = catchErrSync(
          () =>
            new QCMDeclarativeAnsweredEvent({
              id,
              occurredAt,
              createdAt,
              passageId,
              sequenceNumber,
              elementId,
              answer,
            }),
        )();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The answer is required for a QCMDeclarativeAnsweredEvent');
      });
    });
  });

  describe('#QCUDiscoveryAnsweredEvent', function () {
    it('should init and keep attributes', function () {
      // given
      const id = Symbol('id');
      const occurredAt = new Date();
      const createdAt = new Date();
      const passageId = 2;
      const sequenceNumber = 3;
      const elementId = '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095';
      const answer = 'Poire';
      const status = 'ok';

      // when
      const qcuAnsweredEvent = new QCUDiscoveryAnsweredEvent({
        id,
        occurredAt,
        createdAt,
        passageId,
        sequenceNumber,
        elementId,
        answer,
        status,
      });

      // then
      expect(qcuAnsweredEvent.id).to.equal(id);
      expect(qcuAnsweredEvent.type).to.equal('QCU_DISCOVERY_ANSWERED');
      expect(qcuAnsweredEvent.occurredAt).to.equal(occurredAt);
      expect(qcuAnsweredEvent.createdAt).to.equal(createdAt);
      expect(qcuAnsweredEvent.passageId).to.equal(passageId);
      expect(qcuAnsweredEvent.sequenceNumber).to.equal(sequenceNumber);
      expect(qcuAnsweredEvent.data).to.deep.equal({ elementId, answer, status });
    });
  });

  describe('#QROCMAnsweredEvent', function () {
    it('should init and keep attributes', function () {
      // given
      const id = Symbol('id');
      const occurredAt = new Date();
      const createdAt = new Date();
      const passageId = 2;
      const sequenceNumber = 3;
      const elementId = '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095';
      const answer = 'Framboise';
      const status = 'ok';

      // when
      const qrocmAnsweredEvent = new QROCMAnsweredEvent({
        id,
        occurredAt,
        createdAt,
        passageId,
        sequenceNumber,
        elementId,
        answer,
        status,
      });

      // then
      expect(qrocmAnsweredEvent.id).to.equal(id);
      expect(qrocmAnsweredEvent.type).to.equal('QROCM_ANSWERED');
      expect(qrocmAnsweredEvent.occurredAt).to.equal(occurredAt);
      expect(qrocmAnsweredEvent.createdAt).to.equal(createdAt);
      expect(qrocmAnsweredEvent.passageId).to.equal(passageId);
      expect(qrocmAnsweredEvent.sequenceNumber).to.equal(sequenceNumber);
      expect(qrocmAnsweredEvent.data).to.deep.equal({ elementId, answer, status });
    });
  });

  describe('#QCMDeclarativeAnsweredEvent', function () {
    it('should init and keep attributes', function () {
      // given
      const id = Symbol('id');
      const occurredAt = new Date();
      const createdAt = new Date();
      const passageId = 2;
      const sequenceNumber = 3;
      const elementId = '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095';
      const answer = '1,2';

      // when
      const qcmDeclarativeAnsweredEvent = new QCMDeclarativeAnsweredEvent({
        id,
        occurredAt,
        createdAt,
        passageId,
        sequenceNumber,
        elementId,
        answer,
      });

      // then
      expect(qcmDeclarativeAnsweredEvent.id).to.equal(id);
      expect(qcmDeclarativeAnsweredEvent.type).to.equal('QCM_DECLARATIVE_ANSWERED');
      expect(qcmDeclarativeAnsweredEvent.occurredAt).to.equal(occurredAt);
      expect(qcmDeclarativeAnsweredEvent.createdAt).to.equal(createdAt);
      expect(qcmDeclarativeAnsweredEvent.passageId).to.equal(passageId);
      expect(qcmDeclarativeAnsweredEvent.sequenceNumber).to.equal(sequenceNumber);
      expect(qcmDeclarativeAnsweredEvent.data).to.deep.equal({ elementId, answer });
    });

    describe('when answer is not given', function () {
      it('should throw an error', function () {
        // given
        const id = Symbol('id');
        const occurredAt = new Date();
        const createdAt = new Date();
        const passageId = 2;
        const sequenceNumber = 3;
        const elementId = '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095';
        const answer = undefined;

        // when
        const error = catchErrSync(
          () =>
            new QCUDeclarativeAnsweredEvent({
              id,
              occurredAt,
              createdAt,
              passageId,
              sequenceNumber,
              elementId,
              answer,
            }),
        )();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The answer is required for a QCUDeclarativeAnsweredEvent');
      });
    });
  });
});
