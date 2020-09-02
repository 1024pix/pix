const _ = require('lodash');
const { expect, airtableBuilder } = require('../../../test-helper');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');
const Tube = require('../../../../lib/domain/models/Tube');
const tubeRepository = require('../../../../lib/infrastructure/repositories/tube-repository');

describe('Integration | Repository | tube-repository', () => {

  afterEach(() => {
    airtableBuilder.cleanAll();
    return cache.flushAll();
  });

  describe('#get', () => {
    const expectedTube = {
      id: 'recTube0',
      name: 'tubeName',
      title: 'tubeTitle',
      description: 'tubeDescription',
      practicalTitle: 'tubePracticalTitle',
      practicalDescription: 'tubePracticalDescription',
      competenceId: 'recCompetence0',
    };
    const ignoredSkill = {
      id: 'recSkill0',
      challenges: [],
    };

    const learningContent = [
      {
        id: 'recArea0',
        competences: [
          {
            id: expectedTube.competenceId,
            tubes: [{ ...expectedTube, skills: [ignoredSkill] }],
          },
        ]
      }
    ];

    beforeEach(() => {
      const airTableObjects = airtableBuilder.factory.buildLearningContent(learningContent);
      airtableBuilder.mockLists(airTableObjects);
    });

    it('should return the tube without setting skills', async () => {
      // when
      const tube = await tubeRepository.get(expectedTube.id);

      // then
      expect(tube).to.be.instanceof(Tube);
      expect(_.omit(tube, 'skills')).to.deep.equal(expectedTube);
      expect(tube.skills).to.be.empty;
    });
  });

  describe('#list', () => {
    const expectedTube0 = {
      id: 'recTube0',
      name: 'ZtubeName0',
      title: 'tubeTitle0',
      description: 'tubeDescription0',
      practicalTitle: 'tubePracticalTitle0',
      practicalDescription: 'tubePracticalDescription0',
      competenceId: 'recCompetence0',
    };
    const expectedTube1 = {
      id: 'recTube1',
      name: 'AtubeName1',
      title: 'tubeTitle1',
      description: 'tubeDescription1',
      practicalTitle: 'tubePracticalTitle1',
      practicalDescription: 'tubePracticalDescription1',
      competenceId: 'recCompetence1',
    };
    const ignoredSkill = {
      id: 'recSkill0',
      challenges: [],
    };

    const learningContent = [
      {
        id: 'recArea0',
        competences: [
          {
            id: expectedTube0.competenceId,
            tubes: [{ ...expectedTube0, skills: [ignoredSkill] }],
          },
          {
            id: expectedTube1.competenceId,
            tubes: [{ ...expectedTube1, skills: [] }],
          },
        ]
      }
    ];

    beforeEach(() => {
      const airTableObjects = airtableBuilder.factory.buildLearningContent(learningContent);
      airtableBuilder.mockLists(airTableObjects);
    });

    it('should return the tubes without setting skills ordered by name', async () => {
      // when
      const tubes = await tubeRepository.list();

      // then
      expect(tubes).to.have.lengthOf(2);
      expect(tubes[0]).to.be.instanceof(Tube);
      expect(_.omit(tubes[0], 'skills')).to.deep.equal(expectedTube1);
      expect(tubes[0].skills).to.be.empty;
      expect(_.omit(tubes[1], 'skills')).to.deep.equal(expectedTube0);
      expect(tubes[1].skills).to.be.empty;
    });
  });

  describe('#findByNames', () => {
    const expectedTube0 = {
      id: 'recTube0',
      name: 'ZtubeName0',
      title: 'tubeTitle0',
      description: 'tubeDescription0',
      practicalTitleFr: 'tubePracticalTitleFR0',
      practicalTitleEn: 'tubePracticalTitleEN0',
      practicalDescriptionFr: 'tubePracticalDescriptionFR0',
      practicalDescriptionEn: 'tubePracticalDescriptionEN0',
      competenceId: 'recCompetence0',
    };
    const expectedTube1 = {
      id: 'recTube1',
      name: 'AtubeName1',
      title: 'tubeTitle1',
      description: 'tubeDescription1',
      practicalTitleFr: 'tubePracticalTitleFR1',
      practicalTitleEn: 'tubePracticalTitleEN1',
      practicalDescriptionFr: 'tubePracticalDescriptionFR1',
      practicalDescriptionEn: 'tubePracticalDescriptionEN1',
      competenceId: 'recCompetence1',
    };
    const ignoredTube = {
      id: 'recTubeIgn',
      name: 'AtubeNameIgn',
      title: 'tubeTitleIgn',
      description: 'tubeDescriptionIgn',
      practicalTitle: 'tubePracticalTitleIgn',
      practicalDescription: 'tubePracticalDescriptionIgn',
      competenceId: 'recCompetence1',
    };
    const ignoredSkill = {
      id: 'recSkill0',
      challenges: [],
    };

    const learningContent = [
      {
        id: 'recArea0',
        competences: [
          {
            id: expectedTube0.competenceId,
            tubes: [{ ...expectedTube0, skills: [ignoredSkill] }],
          },
          {
            id: expectedTube1.competenceId,
            tubes: [{ ...expectedTube1, skills: [] }, { ...ignoredTube, skills: [] }],
          },
        ]
      }
    ];

    beforeEach(() => {
      const airTableObjects = airtableBuilder.factory.buildLearningContent(learningContent);
      airtableBuilder.mockLists(airTableObjects);
    });

    it('should return the tubes without setting skills ordered by name', async () => {
      // when
      const tubes = await tubeRepository.findByNames({ tubeNames: [expectedTube0.name, expectedTube1.name] });

      // then
      expect(tubes).to.have.lengthOf(2);
      expect(tubes[0]).to.be.instanceof(Tube);
      expect(tubes[1].id).to.equal(expectedTube0.id);
      expect(tubes[1].name).to.equal(expectedTube0.name);
      expect(tubes[1].title).to.equal(expectedTube0.title);
      expect(tubes[1].competenceId).to.equal(expectedTube0.competenceId);
      expect(tubes[0].id).to.equal(expectedTube1.id);
      expect(tubes[0].name).to.equal(expectedTube1.name);
      expect(tubes[0].title).to.equal(expectedTube1.title);
      expect(tubes[0].competenceId).to.equal(expectedTube1.competenceId);
    });

    context('when no locale is provided (using default locale)', () => {

      it('should return the tubes with default locale translation', async () => {
        // when
        const tubes = await tubeRepository.findByNames({ tubeNames: [expectedTube0.name, expectedTube1.name] });

        // then
        expect(tubes).to.have.lengthOf(2);
        expect(tubes[1].practicalTitle).to.equal(expectedTube0.practicalTitleFr);
        expect(tubes[1].practicalDescription).to.equal(expectedTube0.practicalDescriptionFr);
        expect(tubes[0].practicalTitle).to.equal(expectedTube1.practicalTitleFr);
        expect(tubes[0].practicalDescription).to.equal(expectedTube1.practicalDescriptionFr);
      });
    });

    context('when specifying a locale', () => {

      it('should return the tubes with appropriate translation', async () => {
        // when
        const tubes = await tubeRepository.findByNames({
          tubeNames: [expectedTube0.name, expectedTube1.name],
          locale: 'en',
        });

        // then
        expect(tubes[1].practicalTitle).to.equal(expectedTube0.practicalTitleEn);
        expect(tubes[1].practicalDescription).to.equal(expectedTube0.practicalDescriptionEn);
        expect(tubes[0].practicalTitle).to.equal(expectedTube1.practicalTitleEn);
        expect(tubes[0].practicalDescription).to.equal(expectedTube1.practicalDescriptionEn);
      });
    });
  });
});
