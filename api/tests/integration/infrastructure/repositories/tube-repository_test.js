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

  describe('#findByRecordIds', function () {
    beforeEach(function () {
      const learningContentTube0 = {
        id: 'recTube0',
        name: 'tubeName0',
        title: 'tubeTitle0',
        description: 'tubeDescription0',
        practicalTitleFrFr: 'practicalTitreFR0',
        practicalTitleEnUs: 'practicalTitreEN0',
        practicalDescriptionFrFr: 'practicalDescriptionFR0',
        practicalDescriptionEnUs: 'practicalDescriptionEN0',
        competenceId: 'recCompetence0',
      };
      const learningContentTube1 = {
        id: 'recTube1',
        name: 'tubeName1',
        title: 'tubeTitle1',
        description: 'tubeDescription1',
        practicalTitleFrFr: 'practicalTitreFR1',
        practicalTitleEnUs: 'practicalTitreEN1',
        practicalDescriptionFrFr: 'practicalDescriptionFR1',
        practicalDescriptionEnUs: 'practicalDescriptionEN1',
        competenceId: 'recCompetence1',
      };
      const learningContentTube2 = {
        id: 'recTube2',
        name: 'tubeName2',
        title: 'tubeTitle2',
        description: 'tubeDescription2',
        practicalTitleFrFr: 'practicalTitreFR2',
        practicalTitleEnUs: 'practicalTitreEN2',
        practicalDescriptionFrFr: 'practicalDescriptionFR2',
        practicalDescriptionEnUs: 'practicalDescriptionEN2',
        competenceId: 'recCompetence1',
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
      const tube1 = new Tube({
        id: 'recTube1',
        name: 'tubeName1',
        title: 'tubeTitle1',
        description: 'tubeDescription1',
        practicalTitle: 'practicalTitreFR1',
        practicalDescription: 'practicalDescriptionFR1',
        competenceId: 'recCompetence1',
      });
      const tube2 = new Tube({
        id: 'recTube2',
        name: 'tubeName2',
        title: 'tubeTitle2',
        description: 'tubeDescription2',
        practicalTitle: 'practicalTitreFR2',
        practicalDescription: 'practicalDescriptionFR2',
        competenceId: 'recCompetence1',
      });

      // when
      const tubes = await tubeRepository.findByRecordIds(['recTube2', 'recTube1']);

      // then
      expect(tubes).to.deepEqualArray([tube1, tube2]);
    });

    it('should return a list of tubes (locale EN)', async function () {
      // given
      const tube1 = new Tube({
        id: 'recTube1',
        name: 'tubeName1',
        title: 'tubeTitle1',
        description: 'tubeDescription1',
        practicalTitle: 'practicalTitreEN1',
        practicalDescription: 'practicalDescriptionEN1',
        competenceId: 'recCompetence1',
      });
      const tube2 = new Tube({
        id: 'recTube2',
        name: 'tubeName2',
        title: 'tubeTitle2',
        description: 'tubeDescription2',
        practicalTitle: 'practicalTitreEN2',
        practicalDescription: 'practicalDescriptionEN2',
        competenceId: 'recCompetence1',
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

    it('should return a list of english active tubes', async function () {
      // given
      const tube1 = new Tube({
        id: 'recTube1',
        name: 'tubeName1',
        title: 'tubeTitle1',
        description: 'tubeDescription1',
        practicalTitle: 'translatedPracticalTitle1EnUs',
        practicalDescription: 'translatedPracticalDescription1EnUs',
        competenceId: 'recCompetence1',
      });

      const learningContentTube0 = {
        id: 'recTube0',
        name: 'tubeName0',
        title: 'tubeTitle0',
        description: 'tubeDescription0',
        practicalTitleFrFr: 'translatedPracticalTitle0',
        practicalDescriptionFrFr: 'translatedPracticalDescription0',
        practicalTitleEnUs: 'translatedPracticalTitle0EnUs',
        practicalDescriptionEnUs: 'translatedPracticalDescription0EnUs',
        competenceId: 'recCompetence0',
      };

      const learningContentTube1 = {
        id: 'recTube1',
        name: 'tubeName1',
        title: 'tubeTitle1',
        description: 'tubeDescription1',
        practicalTitleFrFr: 'translatedPracticalTitle1',
        practicalDescriptionFrFr: 'translatedPracticalDescription1',
        practicalTitleEnUs: 'translatedPracticalTitle1EnUs',
        practicalDescriptionEnUs: 'translatedPracticalDescription1EnUs',
        competenceId: 'recCompetence1',
      };

      const learningContentTube2 = {
        id: 'recTube2',
        name: 'tubeName2',
        title: 'tubeTitle2',
        description: 'tubeDescription2',
        practicalTitleFrFr: 'translatedPracticalTitle2',
        practicalDescriptionFrFr: 'translatedPracticalDescription2',
        practicalTitleEnUs: 'translatedPracticalTitle2EnUs',
        practicalDescriptionEnUs: 'translatedPracticalDescription2EnUs',
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
      const tubes = await tubeRepository.findActiveByRecordIds(['recTube1', 'recTube2'], 'en');

      // then
      expect(tubes).to.have.lengthOf(1);
      expect(tubes[0]).to.deep.equal(tube1);
    });
  });
});
