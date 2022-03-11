const { expect, mockLearningContent } = require('../../../test-helper');
const Tube = require('../../../../lib/domain/models/Tube');
const tubeRepository = require('../../../../lib/infrastructure/repositories/tube-repository');

describe('Integration | Repository | tube-repository', function () {
  describe('#get', function () {
    it('should return the tube', async function () {
      // given
      const expectedTube = new Tube({
        id: 'recTube0',
        name: 'tubeName',
        title: 'tubeTitle',
        description: 'tubeDescription',
        practicalTitle: 'translatedPracticalTitle',
        practicalDescription: 'translatedPracticalDescription',
        competenceId: 'recCompetence0',
      });
      const learningContent = {
        tubes: [
          {
            id: 'recTube0',
            name: 'tubeName',
            title: 'tubeTitle',
            description: 'tubeDescription',
            practicalTitleFrFr: 'translatedPracticalTitle',
            practicalDescriptionFrFr: 'translatedPracticalDescription',
            competenceId: 'recCompetence0',
          },
        ],
      };
      mockLearningContent(learningContent);

      // when
      const tube = await tubeRepository.get(expectedTube.id);

      // then
      expect(tube).to.be.instanceof(Tube);
      expect(tube).to.deep.equal(expectedTube);
    });
  });

  describe('#list', function () {
    it('should return the tubes', async function () {
      // given
      const tube0 = new Tube({
        id: 'recTube0',
        name: 'tubeName0',
        title: 'tubeTitle0',
        description: 'tubeDescription0',
        practicalTitle: 'translatedPracticalTitle0',
        practicalDescription: 'translatedPracticalDescription0',
        competenceId: 'recCompetence0',
      });
      const tube1 = new Tube({
        id: 'recTube1',
        name: 'tubeName1',
        title: 'tubeTitle1',
        description: 'tubeDescription1',
        practicalTitle: 'translatedPracticalTitle1',
        practicalDescription: 'translatedPracticalDescription1',
        competenceId: 'recCompetence1',
      });
      const learningContentTube0 = {
        id: 'recTube0',
        name: 'tubeName0',
        title: 'tubeTitle0',
        description: 'tubeDescription0',
        practicalTitleFrFr: 'translatedPracticalTitle0',
        practicalDescriptionFrFr: 'translatedPracticalDescription0',
        competenceId: 'recCompetence0',
      };

      const learningContentTube1 = {
        id: 'recTube1',
        name: 'tubeName1',
        title: 'tubeTitle1',
        description: 'tubeDescription1',
        practicalTitleFrFr: 'translatedPracticalTitle1',
        practicalDescriptionFrFr: 'translatedPracticalDescription1',
        competenceId: 'recCompetence1',
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
      const tube0 = new Tube({
        id: 'recTube0',
        name: 'tubeName0',
        title: 'tubeTitle0',
        description: 'tubeDescription0',
        practicalTitle: 'translatedPracticalTitle0',
        practicalDescription: 'translatedPracticalDescription0',
        competenceId: 'recCompetence0',
      });

      const tube1 = new Tube({
        id: 'recTube1',
        name: 'tubeName1',
        title: 'tubeTitle1',
        description: 'tubeDescription1',
        practicalTitle: 'translatedPracticalTitle1',
        practicalDescription: 'translatedPracticalDescription1',
        competenceId: 'recCompetence1',
      });

      const learningContentTube0 = {
        id: 'recTube0',
        name: 'tubeName0',
        title: 'tubeTitle0',
        description: 'tubeDescription0',
        practicalTitleFrFr: 'translatedPracticalTitle0',
        practicalDescriptionFrFr: 'translatedPracticalDescription0',
        competenceId: 'recCompetence0',
      };

      const learningContentTube1 = {
        id: 'recTube1',
        name: 'tubeName1',
        title: 'tubeTitle1',
        description: 'tubeDescription1',
        practicalTitleFrFr: 'translatedPracticalTitle1',
        practicalDescriptionFrFr: 'translatedPracticalDescription1',
        competenceId: 'recCompetence1',
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
        const expectedTube = new Tube({
          id: 'recTube0',
          name: 'tubeName',
          title: 'tubeTitle',
          description: 'tubeDescription',
          practicalTitle: 'translatedPracticalTitle',
          practicalDescription: 'translatedPracticalDescription',
          competenceId: 'recCompetence0',
        });
        const learningContent = {
          tubes: [
            {
              id: 'recTube0',
              name: 'tubeName',
              title: 'tubeTitle',
              description: 'tubeDescription',
              practicalTitleFrFr: 'translatedPracticalTitle',
              practicalDescriptionFrFr: 'translatedPracticalDescription',
              competenceId: 'recCompetence0',
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
        const expectedTube = new Tube({
          id: 'recTube0',
          name: 'tubeName',
          title: 'tubeTitle',
          description: 'tubeDescription',
          practicalTitle: 'translatedPracticalTitleEnUs',
          practicalDescription: 'translatedPracticalDescriptionEnUs',
          competenceId: 'recCompetence0',
        });
        const learningContent = {
          tubes: [
            {
              id: 'recTube0',
              name: 'tubeName',
              title: 'tubeTitle',
              description: 'tubeDescription',
              practicalTitleFrFr: 'translatedPracticalTitle',
              practicalTitleEnUs: 'translatedPracticalTitleEnUs',
              practicalDescriptionFrFr: 'translatedPracticalDescription',
              practicalDescriptionEnUs: 'translatedPracticalDescriptionEnUs',
              competenceId: 'recCompetence0',
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

  describe('#findActivesFromFramework', function () {
    it('should return the active tubes from pix framework', async function () {
      // given
      const tube0 = new Tube({
        id: 'recTube0',
        name: 'tubeName0',
        competenceId: 'recCompetence0',
      });

      const learningContentSkill0 = {
        id: 'recSkill0',
        status: 'actif',
        tubeId: 'recTube0',
      };

      const learningContentSkill1 = {
        id: 'recSkill1',
        status: 'archivé',
        tubeId: 'recTube1',
      };

      const learningContentSkill2 = {
        id: 'recSkill2',
        status: 'actif',
        tubeId: 'recTube2',
      };

      const learningContentTube0 = {
        id: 'recTube0',
        name: 'tubeName0',
        competenceId: 'recCompetence0',
      };

      const learningContentTube1 = {
        id: 'recTube1',
        name: '@tubeName1',
        competenceId: 'recCompetence0',
      };

      const learningContentTube2 = {
        id: 'recTube2',
        name: '@tubeName1',
        competenceId: 'recCompetence1',
      };

      const learningContentCompetence0 = {
        id: 'recCompetence0',
        origin: 'Pix',
      };

      const learningContentCompetence1 = {
        id: 'recCompetence1',
        origin: 'Pix plus',
      };

      mockLearningContent({
        tubes: [learningContentTube0, learningContentTube1, learningContentTube2],
        skills: [learningContentSkill0, learningContentSkill1, learningContentSkill2],
        competences: [learningContentCompetence0, learningContentCompetence1],
      });

      // when
      const tubes = await tubeRepository.findActivesFromPixFramework();

      // then
      expect(tubes.length).to.equal(1);
      expect(tubes[0]).to.deep.equal(tube0);
    });

    it('should return tubes in the specified locale', async function () {
      // given
      const tube0 = new Tube({
        id: 'recTube0',
        name: 'tubeName0',
        practicalTitle: 'translatedPracticalTitle1',
        practicalDescription: 'translatedPracticalDescription1',
        competenceId: 'recCompetence0',
      });

      const learningContentSkill0 = {
        id: 'recSkill0',
        status: 'actif',
        tubeId: 'recTube0',
      };

      const learningContentTube0 = {
        id: 'recTube0',
        name: 'tubeName0',
        practicalTitleEnUs: 'translatedPracticalTitle1',
        practicalDescriptionEnUs: 'translatedPracticalDescription1',
        competenceId: 'recCompetence0',
      };

      const learningContentCompetence0 = {
        id: 'recCompetence0',
        origin: 'Pix',
      };

      mockLearningContent({
        tubes: [learningContentTube0],
        skills: [learningContentSkill0],
        competences: [learningContentCompetence0],
      });
      const locale = 'en';

      // when
      const tubes = await tubeRepository.findActivesFromPixFramework(locale);

      // then
      expect(tubes.length).to.equal(1);
      expect(tubes[0]).to.deep.equal(tube0);
    });
  });

  describe('#findActiveByRecordIds', function () {
    it('should return a list of active tubes', async function () {
      // given
      const tube1 = new Tube({
        id: 'recTube1',
        name: 'tubeName1',
        title: 'tubeTitle1',
        description: 'tubeDescription1',
        practicalTitle: 'translatedPracticalTitle1',
        practicalDescription: 'translatedPracticalDescription1',
        competenceId: 'recCompetence1',
      });

      const learningContentTube0 = {
        id: 'recTube0',
        name: 'tubeName0',
        title: 'tubeTitle0',
        description: 'tubeDescription0',
        practicalTitleFrFr: 'translatedPracticalTitle0',
        practicalDescriptionFrFr: 'translatedPracticalDescription0',
        competenceId: 'recCompetence0',
      };

      const learningContentTube1 = {
        id: 'recTube1',
        name: 'tubeName1',
        title: 'tubeTitle1',
        description: 'tubeDescription1',
        practicalTitleFrFr: 'translatedPracticalTitle1',
        practicalDescriptionFrFr: 'translatedPracticalDescription1',
        competenceId: 'recCompetence1',
      };

      const learningContentTube2 = {
        id: 'recTube2',
        name: 'tubeName2',
        title: 'tubeTitle2',
        description: 'tubeDescription2',
        practicalTitleFrFr: 'translatedPracticalTitle2',
        practicalDescriptionFrFr: 'translatedPracticalDescription2',
        competenceId: 'recCompetence2',
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
  });
});
