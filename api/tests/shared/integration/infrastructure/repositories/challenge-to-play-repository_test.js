import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import * as challengeToPlayRepository from '../../../../../src/shared/infrastructure/repositories/challenge-to-play-repository.js';
import { catchErr, databaseBuilder, domainBuilder, expect, nock } from '../../../../test-helper.js';

describe('Integration | Repository | challenge-repository', function () {
  const challengeDataWithoutComponent = {
    id: 'challengeId00',
    instruction: 'instruction challengeId00',
    alternativeInstruction: 'alternativeInstruction challengeId00',
    proposals: 'proposals challengeId00',
    type: 'QCU',
    solution: 'solution challengeId00',
    solutionToDisplay: 'solutionToDisplay challengeId00',
    t1Status: true,
    t2Status: false,
    t3Status: true,
    status: 'validé',
    genealogy: 'genealogy challengeId00',
    accessibility1: 'accessibility1 challengeId00',
    accessibility2: 'accessibility2 challengeId00',
    requireGafamWebsiteAccess: true,
    isIncompatibleIpadCertif: false,
    deafAndHardOfHearing: 'deafAndHardOfHearing challengeId00',
    isAwarenessChallenge: true,
    toRephrase: false,
    alternativeVersion: 10,
    shuffled: true,
    illustrationAlt: 'illustrationAlt challengeId00',
    illustrationUrl: 'illustrationUrl challengeId00',
    attachments: ['attachment1', 'attachment2'],
    responsive: 'responsive challengeId00',
    alpha: 1.1,
    delta: 3.3,
    autoReply: true,
    focusable: true,
    format: 'format challengeId00',
    timer: 180,
    embedHeight: 800,
    embedUrl: 'embedUrl challengeId00',
    embedTitle: 'embedTitle challengeId00',
    locales: ['fr', 'nl'],
    competenceId: 'competenceId00',
    skillId: 'skillId00',
    hasEmbedInternalValidation: true,
    noValidationNeeded: true,
  };
  const challengeDataWithComponent = {
    id: 'challengeId01',
    instruction: 'instruction challengeId01',
    alternativeInstruction: 'alternativeInstruction challengeId01',
    proposals: 'proposals challengeId01',
    type: 'QCU',
    solution: 'solution challengeId01',
    solutionToDisplay: 'solutionToDisplay challengeId01',
    t1Status: false,
    t2Status: true,
    t3Status: true,
    status: 'validé',
    genealogy: 'genealogy challengeId01',
    accessibility1: 'accessibility1 challengeId01',
    accessibility2: 'accessibility2 challengeId01',
    requireGafamWebsiteAccess: false,
    isIncompatibleIpadCertif: true,
    deafAndHardOfHearing: 'deafAndHardOfHearing challengeId01',
    isAwarenessChallenge: true,
    toRephrase: false,
    alternativeVersion: 20,
    shuffled: false,
    illustrationAlt: 'illustrationAlt challengeId01',
    illustrationUrl: 'illustrationUrl challengeId01',
    attachments: ['attachment1', 'attachment2'],
    responsive: 'responsive challengeId01',
    alpha: 1.2,
    delta: 3.4,
    autoReply: true,
    focusable: false,
    format: 'format challengeId01',
    timer: 180,
    embedHeight: 801,
    embedUrl: 'https://example.com/embed.json',
    embedTitle: 'embedTitle challengeId01',
    locales: ['fr', 'en'],
    competenceId: 'competenceId00',
    skillId: 'skillId00',
    hasEmbedInternalValidation: true,
    noValidationNeeded: true,
  };

  beforeEach(async function () {
    databaseBuilder.factory.learningContent.build({
      challenges: [challengeDataWithComponent, challengeDataWithoutComponent],
    });
    await databaseBuilder.commit();
  });

  describe('#get', function () {
    context('when the challenge has an embed as webcomponent', function () {
      context('when retrieving the resource successfully', function () {
        it('should return the challenge with the loaded web component', async function () {
          // given
          const webComponentServerCall = nock('https://example.com')
            .get('/embed.json')
            .reply(200, JSON.stringify({ name: 'web-component', props: { prop1: 'value1', prop2: 'value2' } }));

          // when
          const challenge = await challengeToPlayRepository.get('challengeId01');

          // then
          expect(webComponentServerCall.isDone()).to.equal(true);
          expect(challenge).to.deepEqualInstance(
            domainBuilder.shared.buildChallengeToPlay({
              ...challengeDataWithComponent,
              focused: challengeDataWithComponent.focusable,
              webComponentTagName: 'web-component',
              webComponentProps: { prop1: 'value1', prop2: 'value2' },
            }),
          );
        });
      });

      context('when we fail retrieving the resource', function () {
        it('should throw a NotFound error', async function () {
          // given
          const webComponentServerCall = nock('https://example.com').get('/embed.json').reply(404);

          // when
          const err = await catchErr(challengeToPlayRepository.get)('challengeId01');

          // then
          expect(webComponentServerCall.isDone()).to.equal(true);
          expect(err).to.be.instanceOf(NotFoundError);
          expect(err.message).to.equal(
            `Embed webcomponent config with URL ${challengeDataWithComponent.embedUrl} in challenge ${challengeDataWithComponent.id} not found`,
          );
        });
      });
    });

    context('when the challenge has no embed as webcomponent', function () {
      it('should return the challenge', async function () {
        // when
        const challenge = await challengeToPlayRepository.get('challengeId00');

        // then
        expect(challenge).to.deepEqualInstance(
          domainBuilder.shared.buildChallengeToPlay({
            ...challengeDataWithoutComponent,
            focused: challengeDataWithComponent.focusable,
            webComponentTagName: null,
            webComponentProps: null,
          }),
        );
      });
    });
  });
});
