import { expect, mockLearningContent, domainBuilder } from '../../../test-helper';
import tubeRepository from '../../../../lib/infrastructure/repositories/tube-repository';

describe('Integration | Repository | tube-repository', function () {
  describe('#get', function () {
    it('should return the tube', async function () {
      // given
      const expectedTube = domainBuilder.buildTube({
        id: 'recTube0',
        name: 'tubeName',
        title: 'tubeTitle',
        description: 'tubeDescription',
        practicalTitle: 'translatedPracticalTitle',
        practicalDescription: 'translatedPracticalDescription',
        isMobileCompliant: true,
        isTabletCompliant: true,
        competenceId: 'recCompetence0',
        thematicId: 'thematicCoucou',
        skillIds: ['skillSuper', 'skillGenial'],
        skills: [],
      });
      const learningContent = {
        tubes: [
          {
            id: 'recTube0',
            name: 'tubeName',
            title: 'tubeTitle',
            description: 'tubeDescription',
            practicalTitle_i18n: {
              fr: 'translatedPracticalTitle',
            },
            practicalDescription_i18n: {
              fr: 'translatedPracticalDescription',
            },
            isMobileCompliant: true,
            isTabletCompliant: true,
            competenceId: 'recCompetence0',
            thematicId: 'thematicCoucou',
            skillIds: ['skillSuper', 'skillGenial'],
          },
        ],
      };
      mockLearningContent(learningContent);

      // when
      const tube = await tubeRepository.get(expectedTube.id);

      // then
      expect(tube).to.deepEqualInstance(expectedTube);
    });
  });

  describe('#list', function () {
    it('should return the tubes', async function () {
      // given
      const tube0 = domainBuilder.buildTube({
        id: 'recTube0',
        name: 'tubeName0',
        title: 'tubeTitle0',
        description: 'tubeDescription0',
        practicalTitle: 'translatedPracticalTitle0',
        practicalDescription: 'translatedPracticalDescription0',
        isMobileCompliant: true,
        isTabletCompliant: true,
        competenceId: 'recCompetence0',
        thematicId: 'thematicCoucou',
        skillIds: ['skillSuper', 'skillGenial'],
        skills: [],
      });
      const tube1 = domainBuilder.buildTube({
        id: 'recTube1',
        name: 'tubeName1',
        title: 'tubeTitle1',
        description: 'tubeDescription1',
        practicalTitle: 'translatedPracticalTitle1',
        practicalDescription: 'translatedPracticalDescription1',
        isMobileCompliant: false,
        isTabletCompliant: false,
        competenceId: 'recCompetence1',
        thematicId: 'thematicCava',
        skillIds: ['skillPoire', 'skillPeche'],
        skills: [],
      });
      const learningContentTube0 = {
        id: 'recTube0',
        name: 'tubeName0',
        title: 'tubeTitle0',
        description: 'tubeDescription0',
        practicalTitle_i18n: {
          fr: 'translatedPracticalTitle0',
        },
        practicalDescription_i18n: {
          fr: 'translatedPracticalDescription0',
        },
        isMobileCompliant: true,
        isTabletCompliant: true,
        competenceId: 'recCompetence0',
        thematicId: 'thematicCoucou',
        skillIds: ['skillSuper', 'skillGenial'],
      };

      const learningContentTube1 = {
        id: 'recTube1',
        name: 'tubeName1',
        title: 'tubeTitle1',
        description: 'tubeDescription1',
        practicalTitle_i18n: {
          fr: 'translatedPracticalTitle1',
        },
        practicalDescription_i18n: {
          fr: 'translatedPracticalDescription1',
        },
        isMobileCompliant: false,
        isTabletCompliant: false,
        competenceId: 'recCompetence1',
        thematicId: 'thematicCava',
        skillIds: ['skillPoire', 'skillPeche'],
      };
      mockLearningContent({ tubes: [learningContentTube0, learningContentTube1] });

      // when
      const tubes = await tubeRepository.list();

      // then
      expect(tubes).to.have.length(2);
      expect(tubes[0]).to.deep.equal(tube0);
      expect(tubes[1]).to.deep.equal(tube1);
    });
  });

  describe('#findByNames', function () {
    it('should return the tubes ordered by name', async function () {
      // given
      const tube0 = domainBuilder.buildTube({
        id: 'recTube0',
        name: 'tubeName0',
        title: 'tubeTitle0',
        description: 'tubeDescription0',
        practicalTitle: 'translatedPracticalTitle0',
        practicalDescription: 'translatedPracticalDescription0',
        isMobileCompliant: true,
        isTabletCompliant: true,
        competenceId: 'recCompetence0',
        thematicId: 'thematicCoucou',
        skillIds: ['skillSuper', 'skillGenial'],
        skills: [],
      });

      const tube1 = domainBuilder.buildTube({
        id: 'recTube1',
        name: 'tubeName1',
        title: 'tubeTitle1',
        description: 'tubeDescription1',
        practicalTitle: 'translatedPracticalTitle1',
        practicalDescription: 'translatedPracticalDescription1',
        isMobileCompliant: false,
        isTabletCompliant: false,
        competenceId: 'recCompetence1',
        thematicId: 'thematicCava',
        skillIds: ['skillPoire', 'skillPeche'],
        skills: [],
      });

      const learningContentTube0 = {
        id: 'recTube0',
        name: 'tubeName0',
        title: 'tubeTitle0',
        description: 'tubeDescription0',
        practicalTitle_i18n: {
          fr: 'translatedPracticalTitle0',
        },
        practicalDescription_i18n: {
          fr: 'translatedPracticalDescription0',
        },
        isMobileCompliant: true,
        isTabletCompliant: true,
        competenceId: 'recCompetence0',
        thematicId: 'thematicCoucou',
        skillIds: ['skillSuper', 'skillGenial'],
      };

      const learningContentTube1 = {
        id: 'recTube1',
        name: 'tubeName1',
        title: 'tubeTitle1',
        description: 'tubeDescription1',
        practicalTitle_i18n: {
          fr: 'translatedPracticalTitle1',
        },
        practicalDescription_i18n: {
          fr: 'translatedPracticalDescription1',
        },
        isMobileCompliant: false,
        isTabletCompliant: false,
        competenceId: 'recCompetence1',
        thematicId: 'thematicCava',
        skillIds: ['skillPoire', 'skillPeche'],
      };
      mockLearningContent({ tubes: [learningContentTube1, learningContentTube0] });

      // when
      const tubes = await tubeRepository.findByNames({ tubeNames: ['tubeName1', 'tubeName0'] });

      // then
      expect(tubes[0]).to.deep.equal(tube0);
      expect(tubes[1]).to.deep.equal(tube1);
    });

    context('when no locale is provided (using default locale)', function () {
      it('should return the tubes with default locale translation', async function () {
        // given
        const expectedTube = domainBuilder.buildTube({
          id: 'recTube0',
          name: 'tubeName',
          title: 'tubeTitle',
          description: 'tubeDescription',
          practicalTitle: 'translatedPracticalTitle',
          practicalDescription: 'translatedPracticalDescription',
          isMobileCompliant: true,
          isTabletCompliant: true,
          competenceId: 'recCompetence0',
          thematicId: 'thematicCoucou',
          skillIds: ['skillSuper', 'skillGenial'],
          skills: [],
        });
        const learningContent = {
          tubes: [
            {
              id: 'recTube0',
              name: 'tubeName',
              title: 'tubeTitle',
              description: 'tubeDescription',
              practicalTitle_i18n: {
                fr: 'translatedPracticalTitle',
              },
              practicalDescription_i18n: {
                fr: 'translatedPracticalDescription',
              },
              isMobileCompliant: true,
              isTabletCompliant: true,
              competenceId: 'recCompetence0',
              thematicId: 'thematicCoucou',
              skillIds: ['skillSuper', 'skillGenial'],
            },
          ],
        };
        mockLearningContent(learningContent);

        // when
        const tubes = await tubeRepository.findByNames({ tubeNames: ['tubeName'] });

        // then
        expect(tubes[0].practicalTitle).to.equal(expectedTube.practicalTitle);
        expect(tubes[0].practicalDescription).to.equal(expectedTube.practicalDescription);
      });
    });

    context('when specifying a locale', function () {
      it('should return the tubes with appropriate translation', async function () {
        // given
        const expectedTube = domainBuilder.buildTube({
          id: 'recTube0',
          name: 'tubeName',
          title: 'tubeTitle',
          description: 'tubeDescription',
          practicalTitle: 'translatedPracticalTitleEnUs',
          practicalDescription: 'translatedPracticalDescriptionEnUs',
          isMobileCompliant: true,
          isTabletCompliant: true,
          competenceId: 'recCompetence0',
          thematicId: 'thematicCoucou',
          skillIds: ['skillSuper', 'skillGenial'],
          skills: [],
        });
        const learningContent = {
          tubes: [
            {
              id: 'recTube0',
              name: 'tubeName',
              title: 'tubeTitle',
              description: 'tubeDescription',
              practicalTitle_i18n: {
                fr: 'translatedPracticalTitle',
                en: 'translatedPracticalTitleEnUs',
              },
              practicalDescription_i18n: {
                fr: 'translatedPracticalDescription',
                en: 'translatedPracticalDescriptionEnUs',
              },
              isMobileCompliant: true,
              isTabletCompliant: true,
              competenceId: 'recCompetence0',
              thematicId: 'thematicCoucou',
              skillIds: ['skillSuper', 'skillGenial'],
            },
          ],
        };
        mockLearningContent(learningContent);
        const locale = 'en';

        // when
        const tubes = await tubeRepository.findByNames({ tubeNames: 'tubeName', locale });

        // then
        expect(tubes[0].practicalTitle).to.equal(expectedTube.practicalTitle);
        expect(tubes[0].practicalDescription).to.equal(expectedTube.practicalDescription);
      });
    });
  });

  describe('#findByRecordIds', function () {
    beforeEach(function () {
      const learningContentTube0 = {
        id: 'recTube0',
        name: 'tubeName0',
        title: 'tubeTitle0',
        description: 'tubeDescription0',
        practicalTitle_i18n: {
          fr: 'practicalTitreFR0',
          en: 'practicalTitreEN0',
        },
        practicalDescription_i18n: {
          fr: 'practicalDescriptionFR0',
          en: 'practicalDescriptionEN0',
        },
        isMobileCompliant: true,
        isTabletCompliant: true,
        competenceId: 'recCompetence0',
        thematicId: 'thematicCoucou',
        skillIds: ['skillSuper', 'skillGenial'],
      };
      const learningContentTube1 = {
        id: 'recTube1',
        name: 'tubeName1',
        title: 'tubeTitle1',
        description: 'tubeDescription1',
        practicalTitle_i18n: {
          fr: 'practicalTitreFR1',
          en: 'practicalTitreEN1',
        },
        practicalDescription_i18n: {
          fr: 'practicalDescriptionFR1',
          en: 'practicalDescriptionEN1',
        },
        isMobileCompliant: false,
        isTabletCompliant: false,
        competenceId: 'recCompetence1',
        thematicId: 'thematicCava',
        skillIds: ['skillBien'],
      };
      const learningContentTube2 = {
        id: 'recTube2',
        name: 'tubeName2',
        title: 'tubeTitle2',
        description: 'tubeDescription2',
        practicalTitle_i18n: {
          fr: 'practicalTitreFR2',
          en: 'practicalTitreEN2',
        },
        practicalDescription_i18n: {
          fr: 'practicalDescriptionFR2',
          en: 'practicalDescriptionEN2',
        },
        isMobileCompliant: true,
        isTabletCompliant: false,
        competenceId: 'recCompetence1',
        thematicId: 'thematicCuisse',
        skillIds: ['skillPoulet'],
      };
      const skills = [
        {
          id: 'skillId0',
          tubeId: 'recTube0',
        },
        {
          id: 'skillId1',
          tubeId: 'recTube1',
        },
        {
          id: 'skillId2',
          tubeId: 'recTube2',
        },
      ];
      mockLearningContent({ tubes: [learningContentTube1, learningContentTube0, learningContentTube2], skills });
    });

    it('should return a list of tubes (locale FR - default)', async function () {
      // given
      const tube1 = domainBuilder.buildTube({
        id: 'recTube1',
        name: 'tubeName1',
        title: 'tubeTitle1',
        description: 'tubeDescription1',
        practicalTitle: 'practicalTitreFR1',
        practicalDescription: 'practicalDescriptionFR1',
        isMobileCompliant: false,
        isTabletCompliant: false,
        competenceId: 'recCompetence1',
        thematicId: 'thematicCava',
        skillIds: ['skillBien'],
        skills: [],
      });
      const tube2 = domainBuilder.buildTube({
        id: 'recTube2',
        name: 'tubeName2',
        title: 'tubeTitle2',
        description: 'tubeDescription2',
        practicalTitle: 'practicalTitreFR2',
        practicalDescription: 'practicalDescriptionFR2',
        isMobileCompliant: true,
        isTabletCompliant: false,
        competenceId: 'recCompetence1',
        thematicId: 'thematicCuisse',
        skillIds: ['skillPoulet'],
        skills: [],
      });

      // when
      const tubes = await tubeRepository.findByRecordIds(['recTube2', 'recTube1']);

      // then
      expect(tubes).to.deepEqualArray([tube1, tube2]);
    });

    it('should return a list of tubes (locale EN)', async function () {
      // given
      const tube1 = domainBuilder.buildTube({
        id: 'recTube1',
        name: 'tubeName1',
        title: 'tubeTitle1',
        description: 'tubeDescription1',
        practicalTitle: 'practicalTitreEN1',
        practicalDescription: 'practicalDescriptionEN1',
        isMobileCompliant: false,
        isTabletCompliant: false,
        competenceId: 'recCompetence1',
        thematicId: 'thematicCava',
        skillIds: ['skillBien'],
        skills: [],
      });
      const tube2 = domainBuilder.buildTube({
        id: 'recTube2',
        name: 'tubeName2',
        title: 'tubeTitle2',
        description: 'tubeDescription2',
        practicalTitle: 'practicalTitreEN2',
        practicalDescription: 'practicalDescriptionEN2',
        isMobileCompliant: true,
        isTabletCompliant: false,
        competenceId: 'recCompetence1',
        thematicId: 'thematicCuisse',
        skillIds: ['skillPoulet'],
        skills: [],
      });

      // when
      const tubes = await tubeRepository.findByRecordIds(['recTube2', 'recTube1'], 'en');

      // then
      expect(tubes).to.deepEqualArray([tube1, tube2]);
    });
  });

  describe('#findActiveByRecordIds', function () {
    it('should return a list of active tubes', async function () {
      // given
      const tube1 = domainBuilder.buildTube({
        id: 'recTube1',
        name: 'tubeName1',
        title: 'tubeTitle1',
        description: 'tubeDescription1',
        practicalTitle: 'translatedPracticalTitle1',
        practicalDescription: 'translatedPracticalDescription1',
        isMobileCompliant: true,
        isTabletCompliant: true,
        competenceId: 'recCompetence1',
        thematicId: 'thematicCava',
        skillIds: ['skillCool'],
        skills: [],
      });

      const learningContentTube0 = {
        id: 'recTube0',
        name: 'tubeName0',
        title: 'tubeTitle0',
        description: 'tubeDescription0',
        practicalTitle_i18n: {
          fr: 'translatedPracticalTitle0',
        },
        practicalDescription_i18n: {
          fr: 'translatedPracticalDescription0',
        },
        isMobileCompliant: false,
        isTabletCompliant: false,
        competenceId: 'recCompetence0',
        thematicId: 'thematicCoucou',
        skillIds: ['skillSuper', 'skillGenial'],
      };

      const learningContentTube1 = {
        id: 'recTube1',
        name: 'tubeName1',
        title: 'tubeTitle1',
        description: 'tubeDescription1',
        practicalTitle_i18n: {
          fr: 'translatedPracticalTitle1',
        },
        practicalDescription_i18n: {
          fr: 'translatedPracticalDescription1',
        },
        isMobileCompliant: true,
        isTabletCompliant: true,
        competenceId: 'recCompetence1',
        thematicId: 'thematicCava',
        skillIds: ['skillCool'],
      };

      const learningContentTube2 = {
        id: 'recTube2',
        name: 'tubeName2',
        title: 'tubeTitle2',
        description: 'tubeDescription2',
        practicalTitle_i18n: {
          fr: 'translatedPracticalTitle2',
        },
        practicalDescription_i18n: {
          fr: 'translatedPracticalDescription2',
        },
        isMobileCompliant: true,
        isTabletCompliant: false,
        competenceId: 'recCompetence2',
        thematicId: 'thematicFruit',
        skillIds: [],
      };

      const skills = [
        {
          id: 'skillId0',
          status: 'actif',
          tubeId: 'recTube0',
        },
        {
          id: 'skillId1',
          status: 'actif',
          tubeId: 'recTube1',
        },
        {
          id: 'skillId2',
          status: 'archivé',
          tubeId: 'recTube2',
        },
      ];
      mockLearningContent({ tubes: [learningContentTube1, learningContentTube0, learningContentTube2], skills });

      // when
      const tubes = await tubeRepository.findActiveByRecordIds(['recTube1', 'recTube2']);

      // then
      expect(tubes).to.have.lengthOf(1);
      expect(tubes[0]).to.deep.equal(tube1);
    });

    it('should return a list of english active tubes', async function () {
      // given
      const tube1 = domainBuilder.buildTube({
        id: 'recTube1',
        name: 'tubeName1',
        title: 'tubeTitle1',
        description: 'tubeDescription1',
        practicalTitle: 'translatedPracticalTitle1EnUs',
        practicalDescription: 'translatedPracticalDescription1EnUs',
        isMobileCompliant: true,
        isTabletCompliant: true,
        competenceId: 'recCompetence1',
        thematicId: 'thematicCava',
        skillIds: ['skillCool'],
        skills: [],
      });

      const learningContentTube0 = {
        id: 'recTube0',
        name: 'tubeName0',
        title: 'tubeTitle0',
        description: 'tubeDescription0',
        practicalTitle_i18n: {
          fr: 'translatedPracticalTitle0',
          en: 'translatedPracticalTitle0EnUs',
        },
        practicalDescription_i18n: {
          fr: 'translatedPracticalDescription0',
          en: 'translatedPracticalDescription0EnUs',
        },
        isMobileCompliant: false,
        isTabletCompliant: false,
        competenceId: 'recCompetence0',
        thematicId: 'thematicCoucou',
        skillIds: ['skillSuper', 'skillGenial'],
      };

      const learningContentTube1 = {
        id: 'recTube1',
        name: 'tubeName1',
        title: 'tubeTitle1',
        description: 'tubeDescription1',
        practicalTitle_i18n: {
          fr: 'translatedPracticalTitle1',
          en: 'translatedPracticalTitle1EnUs',
        },
        practicalDescription_i18n: {
          fr: 'translatedPracticalDescription1',
          en: 'translatedPracticalDescription1EnUs',
        },
        isMobileCompliant: true,
        isTabletCompliant: true,
        competenceId: 'recCompetence1',
        thematicId: 'thematicCava',
        skillIds: ['skillCool'],
      };

      const learningContentTube2 = {
        id: 'recTube2',
        name: 'tubeName2',
        title: 'tubeTitle2',
        description: 'tubeDescription2',
        practicalTitle_i18n: {
          fr: 'translatedPracticalTitle2',
          en: 'translatedPracticalTitle2EnUs',
        },
        practicalDescription_i18n: {
          fr: 'translatedPracticalDescription2',
          en: 'translatedPracticalDescription2EnUs',
        },
        isMobileCompliant: true,
        isTabletCompliant: false,
        competenceId: 'recCompetence2',
        thematicId: 'thematicFruit',
        skillIds: [],
      };

      const skills = [
        {
          id: 'skillId0',
          status: 'actif',
          tubeId: 'recTube0',
        },
        {
          id: 'skillId1',
          status: 'actif',
          tubeId: 'recTube1',
        },
        {
          id: 'skillId2',
          status: 'archivé',
          tubeId: 'recTube2',
        },
      ];
      mockLearningContent({ tubes: [learningContentTube1, learningContentTube0, learningContentTube2], skills });

      // when
      const tubes = await tubeRepository.findActiveByRecordIds(['recTube1', 'recTube2'], 'en');

      // then
      expect(tubes).to.have.lengthOf(1);
      expect(tubes[0]).to.deep.equal(tube1);
    });
  });
});
