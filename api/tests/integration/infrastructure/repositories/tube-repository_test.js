const _ = require('lodash');
const { expect, airtableBuilder, domainBuilder } = require('../../../test-helper');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');
const Tube = require('../../../../lib/domain/models/Tube');
const tubeRepository = require('../../../../lib/infrastructure/repositories/tube-repository');

describe('Integration | Repository | tube-repository', () => {

  afterEach(() => {
    airtableBuilder.cleanAll();
    return cache.flushAll();
  });

  describe('#get', () => {
    it('should return the tube without setting skills', async () => {
      // given
      const expectedTube = domainBuilder.buildTube();
      delete expectedTube.skills;
      const airtableTube = airtableBuilder.factory.buildTube.fromDomain({ domainTube: expectedTube });
      airtableBuilder.mockLists({ tubes: [airtableTube] });

      // when
      const tube = await tubeRepository.get(expectedTube.id);

      // then
      expect(tube).to.be.instanceof(Tube);
      expect(_.omit(tube, 'skills')).to.deep.equal(expectedTube);
      expect(tube.skills).to.be.empty;
    });
  });

  describe('#list', () => {
    it('should return the tubes', async () => {
      // given
      const tube0 = domainBuilder.buildTube();
      delete tube0.skills;
      const tube1 = domainBuilder.buildTube();
      delete tube1.skills;
      const airtableTube0 = airtableBuilder.factory.buildTube.fromDomain({ domainTube: tube0 });
      const airtableTube1 = airtableBuilder.factory.buildTube.fromDomain({ domainTube: tube1 });
      airtableBuilder.mockLists({ tubes: [airtableTube0, airtableTube1] });

      // when
      const tubes = await tubeRepository.list();

      // then
      expect(tubes).to.have.length(2);
      expect(tubes[0]).to.be.instanceof(Tube);
    });

    it('should return tubes without setting skills', async () => {
      // given
      const expectedTube = domainBuilder.buildTube();
      delete expectedTube.skills;
      const airtableTube = airtableBuilder.factory.buildTube.fromDomain({ domainTube: expectedTube });
      airtableBuilder.mockLists({ tubes: [airtableTube] });

      // when
      const tubes = await tubeRepository.list();

      // then
      expect(_.omit(tubes[0], 'skills')).to.deep.equal(expectedTube);
      expect(tubes[0].skills).to.be.empty;
    });
  });

  describe('#findByNames', () => {
    it('should return the tubes without setting skills ordered by name', async () => {
      // given
      const expectedTube = domainBuilder.buildTube();
      delete expectedTube.skills;
      const airtableTube = airtableBuilder.factory.buildTube.fromDomain({ domainTube: expectedTube });
      airtableBuilder.mockLists({ tubes: [airtableTube] });

      // when
      const tubes = await tubeRepository.findByNames({ tubeNames: [expectedTube.name] });

      // then
      expect(_.omit(tubes[0], 'skills')).to.deep.equal(expectedTube);
      expect(tubes[0].skills).to.be.empty;
    });

    context('when no locale is provided (using default locale)', () => {

      it('should return the tubes with default locale translation', async () => {
        // given
        const expectedTube = domainBuilder.buildTube();
        delete expectedTube.skills;
        const airtableTube = airtableBuilder.factory.buildTube.fromDomain({ domainTube: expectedTube });
        airtableBuilder.mockLists({ tubes: [airtableTube] });

        // when
        const tubes = await tubeRepository.findByNames({ tubeNames: [expectedTube.name] });

        // then
        expect(tubes[0].practicalTitle).to.equal(airtableTube.fields['Titre pratique fr-fr']);
        expect(tubes[0].practicalDescription).to.equal(airtableTube.fields['Description pratique fr-fr']);
      });
    });

    context('when specifying a locale', () => {

      it('should return the tubes with appropriate translation', async () => {
        // given
        const locale = 'en';
        const expectedTube = domainBuilder.buildTube();
        delete expectedTube.skills;
        const airtableTube = airtableBuilder.factory.buildTube.fromDomain({ domainTube: expectedTube, locale });
        airtableBuilder.mockLists({ tubes: [airtableTube] });

        // when
        const tubes = await tubeRepository.findByNames({ tubeNames: [expectedTube.name], locale });

        // then
        expect(tubes[0].practicalTitle).to.equal(airtableTube.fields['Titre pratique en-us']);
        expect(tubes[0].practicalDescription).to.equal(airtableTube.fields['Description pratique en-us']);
      });
    });
  });
});
