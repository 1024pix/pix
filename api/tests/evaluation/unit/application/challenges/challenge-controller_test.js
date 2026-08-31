import { expect } from 'chai';
import sinon from 'sinon';

import { challengeController } from '../../../../../src/evaluation/application/challenges/challenge-controller.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Evaluation | Unit | Application | challenge-controller', function () {
  let challengeToPlayRepository, challengeToPlaySerializer;

  beforeEach(async function () {
    challengeToPlayRepository = { get: sinon.stub() };
    challengeToPlaySerializer = { serialize: sinon.stub() };
  });

  describe('#get', function () {
    it('should fetch and return the given challenge, serialized as JSONAPI', async function () {
      // given
      const challengeId = 123;
      const challenge = Symbol('someChallenge');
      const expectedResult = Symbol('serialized-challenge');
      challengeToPlayRepository.get.resolves(challenge);
      challengeToPlaySerializer.serialize.resolves(expectedResult);

      // when
      const response = await challengeController.get({ params: { id: challengeId } }, hFake, {
        challengeToPlayRepository,
        challengeToPlaySerializer,
      });

      // then
      expect(challengeToPlayRepository.get).to.have.been.calledWithExactly(challengeId);
      expect(challengeToPlaySerializer.serialize).to.have.been.calledOnce;
      expect(response).to.deep.equal(expectedResult);
    });
  });
});
