import { databaseBuilder, expect, knex, sinon } from '../../../test-helper.js';
import * as elementAnswerRepository from '../../../../src/devcomp/infrastructure/repositories/element-answer-repository.js';
import { ElementAnswer } from '../../../../src/devcomp/domain/models/ElementAnswer.js';
import { AnswerStatus } from '../../../../src/devcomp/domain/models/validator/AnswerStatus.js';

describe('Integration | DevComp | Repositories | ElementAnswerRepository', function () {
  describe('#save', function () {
    const fakeDate = new Date('2023-12-31');
    let clock;

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now: fakeDate, toFake: ['Date'] });
    });

    afterEach(function () {
      clock.restore();
    });

    it('should have an element answer', async function () {
      // given
      const passage = databaseBuilder.factory.buildPassage({ id: 1, moduleId: 'my-module' });
      await databaseBuilder.commit();

      const passageId = passage.id,
        elementId = 'elementId',
        grainId = 'grainId',
        value = 'val',
        correction = { status: AnswerStatus.OK, feedback: Symbol('feedback'), solution: Symbol('solution') };

      // when
      const returnedElementAnswer = await elementAnswerRepository.save({
        passageId,
        elementId,
        grainId,
        value,
        correction,
      });

      const elementAnswer = new ElementAnswer({ elementId, userResponseValue: value, correction });

      // then
      expect(returnedElementAnswer).to.deepEqualInstanceOmitting(elementAnswer, ['id']);
      expect(returnedElementAnswer.elementId).to.equal(elementId);
      expect(returnedElementAnswer.userResponseValue).to.equal(value);
      expect(returnedElementAnswer.correction.status).to.deep.equal(correction.status);
      expect(returnedElementAnswer.correction.feedback).to.deep.equal(correction.feedback);
      expect(returnedElementAnswer.correction.solution).to.deep.equal(correction.solution);

      const persistedElementAnswer = await knex('element-answers').where({ id: returnedElementAnswer.id }).first();
      expect(persistedElementAnswer.passageId).to.equal(passageId);
      expect(persistedElementAnswer.grainId).to.equal(grainId);
      expect(persistedElementAnswer.elementId).to.equal(elementId);
      expect(persistedElementAnswer.value).to.equal(value);
      expect(persistedElementAnswer.status).to.equal(correction.status.status);
      expect(persistedElementAnswer.createdAt).to.deep.equal(fakeDate);
      expect(persistedElementAnswer.updatedAt).to.deep.equal(fakeDate);
    });
  });
});
