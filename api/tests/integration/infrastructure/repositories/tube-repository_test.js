const { expect, mockLearningContent } = require('../../../test-helper');
const Tube = require('../../../../lib/domain/models/Tube');
const tubeRepository = require('../../../../lib/infrastructure/repositories/tube-repository');

describe('Integration | Repository | tube-repository', () => {

  describe('#get', () => {
    it('should return the tube', async () => {
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
        tubes: [{ 
          id: 'recTube0', 
          name: 'tubeName',
          title: 'tubeTitle',
          description: 'tubeDescription',
          practicalTitleFrFr: 'translatedPracticalTitle',
          practicalDescriptionFrFr: 'translatedPracticalDescription',
          competenceId: 'recCompetence0',
        }],
      };
      mockLearningContent(learningContent);
      
      // when
      const tube = await tubeRepository.get(expectedTube.id);

      // then
      expect(tube).to.be.instanceof(Tube);
      expect(tube).to.deep.equal(expectedTube);
    });
  });

  describe('#list', () => {
    it('should return the tubes', async () => {
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

  describe('#findByNames', () => {
    it('should return the tubes ordered by name', async () => {
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

    context('when no locale is provided (using default locale)', () => {

      it('should return the tubes with default locale translation', async () => {
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
          tubes: [{ 
            id: 'recTube0', 
            name: 'tubeName',
            title: 'tubeTitle',
            description: 'tubeDescription',
            practicalTitleFrFr: 'translatedPracticalTitle',
            practicalDescriptionFrFr: 'translatedPracticalDescription',
            competenceId: 'recCompetence0',
          }],
        };
        mockLearningContent(learningContent);

        // when
        const tubes = await tubeRepository.findByNames({ tubeNames: ['tubeName'] });

        // then
        expect(tubes[0].practicalTitle).to.equal(expectedTube.practicalTitle);
        expect(tubes[0].practicalDescription).to.equal(expectedTube.practicalDescription);
      });
    });

    context('when specifying a locale', () => {

      it('should return the tubes with appropriate translation', async () => {
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
          tubes: [{ 
            id: 'recTube0', 
            name: 'tubeName',
            title: 'tubeTitle',
            description: 'tubeDescription',
            practicalTitleFrFr: 'translatedPracticalTitle',
            practicalTitleEnUs: 'translatedPracticalTitleEnUs',
            practicalDescriptionFrFr: 'translatedPracticalDescription',
            practicalDescriptionEnUs: 'translatedPracticalDescriptionEnUs',
            competenceId: 'recCompetence0',
          }],
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
});
