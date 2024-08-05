import { challengeController } from '../../../../../src/shared/application/challenges/challenge-controller.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { catchErr, domainBuilder, expect, hFake, nock, sinon } from '../../../../test-helper.js';

describe('Unit | Controller | challenge-controller', function () {
  let challengeRepository;
  let challengeSerializer;

  beforeEach(async function () {
    challengeRepository = { get: sinon.stub() };
    challengeSerializer = { serialize: sinon.stub() };
  });

  describe('#get', function () {
    it('should fetch and return the given challenge, serialized as JSONAPI', async function () {
      // given
      const challengeId = 123;
      const challenge = domainBuilder.buildChallenge({ id: challengeId });
      const expectedResult = Symbol('serialized-challenge');
      challengeRepository.get.resolves(challenge);
      challengeSerializer.serialize.resolves(expectedResult);

      // when
      const response = await challengeController.get({ params: { id: challengeId } }, hFake, {
        challengeRepository,
        challengeSerializer,
      });

      // then
      expect(challengeRepository.get).to.have.been.calledWithExactly(challengeId);
      expect(challengeSerializer.serialize).to.have.been.calledOnce;
      expect(response).to.deep.equal(expectedResult);
    });

    describe('when has embed fragment', function () {
      it('should fetch fragment if challenge has embed fragment', async function () {
        // given
        const challengeId = 123;
        const challenge = domainBuilder.buildChallenge({
          embedUrl: 'https://serveur/fr/qcu_image/1d_MiseEnForme_mots.fragment.html',
        });
        challengeRepository.get.resolves(challenge);
        const fragmentServerCall = nock('https://serveur')
          .get('/fr/qcu_image/1d_MiseEnForme_mots.fragment.html')
          .reply(200, 'my html fragment');

        // when
        await challengeController.get({ params: { id: challengeId } }, hFake, {
          challengeRepository,
          challengeSerializer,
        });

        // then
        expect(fragmentServerCall.isDone()).to.equal(true);
        expect(challengeSerializer.serialize).to.have.been.calledWithMatch({
          embedFragment: 'my html fragment',
        });
      });

      it('should throw NotFoundError if URL returns 404', async function () {
        // given
        const challengeId = 123;
        const challenge = domainBuilder.buildChallenge({
          embedUrl: 'https://serveur/fr/qcu_image/non_existing.fragment.html',
        });
        challengeRepository.get.resolves(challenge);
        const fragmentServerCall = nock('https://serveur').get('/fr/qcu_image/non_existing.fragment.html').reply(404);

        // when
        const error = await catchErr(challengeController.get)({ params: { id: challengeId } }, hFake, {
          challengeRepository,
          challengeSerializer,
        });

        // then
        expect(fragmentServerCall.isDone()).to.equal(true);
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });
});
