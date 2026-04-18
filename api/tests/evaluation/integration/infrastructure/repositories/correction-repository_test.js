import * as correctionRepository from '../../../../../src/evaluation/infrastructure/repositories/correction-repository.js';
import { Correction } from '../../../../../src/shared/domain/models/Correction.js';
import { databaseBuilder, domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Integration | Repository | correction-repository', function () {
  let tutorialRepository;

  beforeEach(function () {
    tutorialRepository = {
      findByRecordIdsForCurrentUser: sinon.stub(),
    };
  });

  describe('#getByChallengeId', function () {
    const recordId = 'rec-challengeId';
    const challengeBaseData = {
      id: recordId,
      instruction:
        "Les moteurs de recherche affichent certains liens en raison d'un accord commercial.\n\nDans quels encadrés se trouvent ces liens ?",
      proposals: '- 1\n- 2\n- 3\n- 4\n- 5',
      type: 'QCM',
      solution: '1, 5',
      solutionToDisplay: '1',
      t1Status: true,
      t2Status: false,
      t3Status: true,
      status: 'validé',
      skillId: 'recIdSkill003',
      timer: 1234,
      illustrationUrl: 'https://dl.airtable.com/2MGErxGTQl2g2KiqlYgV_venise4.png',
      illustrationAlt: 'Texte alternatif de l’illustration',
      attachments: [
        'https://dl.airtable.com/nHWKNZZ7SQeOKsOvVykV_navigationdiaporama5.pptx',
        'https://dl.airtable.com/rsXNJrSPuepuJQDByFVA_navigationdiaporama5.odp',
      ],
      competenceId: 'recsvLz0W2ShyfD63',
      embedUrl: 'https://github.io/page/epreuve.html',
      embedTitle: 'Epreuve de selection de dossier',
      embedHeight: 500,
      format: 'petit',
      locales: ['fr'],
      autoReply: false,
      alternativeInstruction: '',
      accessibility1: 'OK',
      accessibility2: 'RAS',
    };
    const userId = 'userId';
    const locale = 'en';
    let expectedHint;
    let expectedTutorials;
    let expectedLearningMoreTutorials;
    const userSavedTutorial = { id: 'userSavedTutorialId', userId, tutorialId: 'recTuto1' };
    const tutorialEvaluation = { id: 'tutorialEvaluationId', userId, tutorialId: 'recTuto1' };

    const userSavedTutorial3 = { id: 'userSavedTutorialId3', userId, tutorialId: 'recTuto3' };
    const tutorialEvaluation3 = { id: 'tutorialEvaluationId3', userId, tutorialId: 'recTuto3' };

    beforeEach(function () {
      expectedHint = domainBuilder.buildHint({
        skillName: '@web1',
        value: 'Can we geo-locate a rabbit on the ice floe?',
      });

      expectedTutorials = [
        domainBuilder.buildTutorial({ id: 'recTuto1', title: 'Comment dresser un panda' }),
        domainBuilder.buildTutorial({ id: 'recTuto2', title: 'Comment dresser un chat' }),
      ];

      expectedTutorials[0].userSavedTutorial = userSavedTutorial;
      expectedTutorials[0].tutorialEvaluation = tutorialEvaluation;

      expectedLearningMoreTutorials = [
        domainBuilder.buildTutorial({ id: 'recTuto3', title: 'Comment dresser un tigre du bengale' }),
        domainBuilder.buildTutorial({ id: 'recTuto4', title: 'Comment dresser une belette' }),
      ];
      expectedLearningMoreTutorials[0].userSavedTutorial = userSavedTutorial3;
      expectedLearningMoreTutorials[0].tutorialEvaluation = tutorialEvaluation3;
    });

    context('normal challenge', function () {
      beforeEach(async function () {
        // given
        databaseBuilder.factory.learningContent.buildSkill({
          id: 'recIdSkill003',
          name: '@web1',
          hintStatus: 'Validé',
          tutorialIds: ['recTuto1'],
          learningMoreTutorialIds: ['recTuto3'],
          hint_i18n: {
            en: 'Can we geo-locate a rabbit on the ice floe?',
            fr: 'Peut-on géo-localiser un lapin sur la banquise ?',
          },
        });
        databaseBuilder.factory.learningContent.buildSkill({
          id: 'skill2',
          name: '@web2',
          hintStatus: 'Proposé',
          tutorialIds: ['recTuto2'],
          learningMoreTutorialIds: ['recTuto4'],
          hint_i18n: {
            en: 'Can we geo-locate a rabbit on the ice floe?',
            fr: 'Peut-on géo-localiser un lapin sur la banquise ?',
          },
        });
        databaseBuilder.factory.learningContent.buildSkill({
          id: 'skill3',
          name: '@web3',
          hintStatus: 'pré-validé',
          tutorialIds: [],
          learningMoreTutorialIds: [],
          hint_i18n: {
            en: 'Can we geo-locate a rabbit on the ice floe?',
            fr: 'Peut-on géo-localiser un lapin sur la banquise ?',
          },
        });
        await databaseBuilder.commit();
        tutorialRepository.findByRecordIdsForCurrentUser
          .withArgs({ ids: ['recTuto1'], userId, locale })
          .resolves(expectedTutorials);
        tutorialRepository.findByRecordIdsForCurrentUser
          .withArgs({ ids: ['recTuto3'], userId, locale })
          .resolves(expectedLearningMoreTutorials);
      });

      it('should return a correction with the solution and solutionToDisplay', async function () {
        // given
        const expectedCorrection = new Correction({
          id: recordId,
          solution: '1, 5',
          solutionToDisplay: '1',
          hint: expectedHint,
          tutorials: expectedTutorials,
          learningMoreTutorials: expectedLearningMoreTutorials,
        });
        databaseBuilder.factory.learningContent.buildChallenge(challengeBaseData);
        await databaseBuilder.commit();

        // when
        const result = await correctionRepository.getByChallengeId({
          challengeId: recordId,
          userId,
          locale,
          tutorialRepository,
        });

        // then
        expect(result).to.be.an.instanceof(Correction);
        expect(result).to.deep.equal(expectedCorrection);
        expect(expectedCorrection.tutorials.map(({ skillId }) => skillId)).to.deep.equal([
          'recIdSkill003',
          'recIdSkill003',
        ]);
      });

      it('should return the correction with validated hint', async function () {
        // given
        databaseBuilder.factory.learningContent.buildChallenge(challengeBaseData);
        await databaseBuilder.commit();

        // when
        const result = await correctionRepository.getByChallengeId({
          challengeId: recordId,
          userId,
          locale,
          tutorialRepository,
        });

        // then
        expect(result.hint).to.deep.equal(expectedHint);
      });

      context('when hint is not available for the provided locale', function () {
        context('but there is a fallback available (ex: fr available for locale fr-fr)', function () {
          it('should return fallback hint', async function () {
            // given
            const userId = 1;
            const providedLocale = 'fr-fr';
            const challengeId = 'recTuto1';
            const challengeId3 = 'recTuto3';
            databaseBuilder.factory.learningContent.buildChallenge({
              ...challengeBaseData,
              id: challengeId,
            });
            await databaseBuilder.commit();
            tutorialRepository.findByRecordIdsForCurrentUser
              .withArgs({ ids: [challengeId], userId, locale: providedLocale })
              .resolves(expectedTutorials);
            tutorialRepository.findByRecordIdsForCurrentUser
              .withArgs({ ids: [challengeId3], userId, locale: providedLocale })
              .resolves(expectedLearningMoreTutorials);

            // when
            const result = await correctionRepository.getByChallengeId({
              challengeId,
              userId,
              locale: providedLocale,
              tutorialRepository,
            });

            // then
            expectedHint = domainBuilder.buildHint({
              skillName: '@web1',
              value: 'Peut-on géo-localiser un lapin sur la banquise ?',
            });
            expect(result.hint).to.deep.equal(expectedHint);
          });
        });

        context('when there is no fallback available ', function () {
          it('should return null value as hint', async function () {
            // given
            const userId = 1;
            const locale = 'jp';
            const challengeId = 'recTuto1';
            const challengeId3 = 'recTuto3';
            databaseBuilder.factory.learningContent.buildChallenge({
              ...challengeBaseData,
              id: challengeId,
            });
            await databaseBuilder.commit();
            tutorialRepository.findByRecordIdsForCurrentUser
              .withArgs({ ids: [challengeId], userId, locale })
              .resolves(expectedTutorials);
            tutorialRepository.findByRecordIdsForCurrentUser
              .withArgs({ ids: [challengeId3], userId, locale })
              .resolves(expectedLearningMoreTutorials);

            // when
            const result = await correctionRepository.getByChallengeId({
              challengeId,
              userId,
              locale,
              tutorialRepository,
            });

            // then
            expect(result.hint).to.be.null;
          });
        });

        context('when provided locale is invalid ', function () {
          it('should return null value as hint', async function () {
            // given
            const userId = 1;
            const providedLocale = 'efr';
            const challengeId = 'recTuto1';
            const challengeId3 = 'recTuto3';
            databaseBuilder.factory.learningContent.buildChallenge({
              ...challengeBaseData,
              id: challengeId,
            });
            await databaseBuilder.commit();
            tutorialRepository.findByRecordIdsForCurrentUser
              .withArgs({ ids: [challengeId], userId, locale: providedLocale })
              .resolves(expectedTutorials);
            tutorialRepository.findByRecordIdsForCurrentUser
              .withArgs({ ids: [challengeId3], userId, locale: providedLocale })
              .resolves(expectedLearningMoreTutorials);

            // when
            const result = await correctionRepository.getByChallengeId({
              challengeId,
              userId,
              locale: providedLocale,
              tutorialRepository,
            });

            // then
            expect(result.hint).to.be.null;
          });
        });
      });
    });
  });
});
