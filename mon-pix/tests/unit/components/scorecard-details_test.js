import { expect } from 'chai';
import sinon from 'sinon';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

describe('Unit | Component | scorecard-details ', function () {
  setupTest();

  describe('#tutorialsGroupedByTubeName', function () {
    it('returns an array of tubes with related tutorials', function () {
      // given
      const tutorial_1 = EmberObject.create({
        modelName: 'tutorial',
        id: 'recR17mopxC9VAmGp',
        title: 'Définition : Lorem Ipsum',
        tubeName: '@web',
        tubePracticalTitle: 'Lorem Ipsum dolor sit',
      });

      const tutorial_2 = EmberObject.create({
        modelName: 'tutorial',
        id: 'recR17mopxC9VAopm',
        title: 'Lorem Ipsum',
        tubeName: '@web',
        tubePracticalTitle: 'Lorem Ipsum dolor sit',
      });

      const tutorial_3 = EmberObject.create({
        modelName: 'tutorial',
        id: 'recR17mopxC9VAoap',
        title: 'Définition : Lorem Ipsum',
        tubeName: '@url',
        tubePracticalTitle: 'Lorem Ipsum dolor sit',
      });

      const tutorials = [tutorial_1, tutorial_2, tutorial_3];
      const scorecard = EmberObject.create({ tutorials });
      const component = createGlimmerComponent('component:scorecard-details', { scorecard });

      const expectedResult = [
        {
          name: tutorial_1.tubeName,
          practicalTitle: tutorial_1.tubePracticalTitle,
          tutorials: [tutorial_1, tutorial_2],
        },
        {
          name: tutorial_3.tubeName,
          practicalTitle: tutorial_3.tubePracticalTitle,
          tutorials: [tutorial_3],
        },
      ];

      // when
      const result = component.tutorialsGroupedByTubeName;

      // then
      expect(result[0].name).to.deep.equal(expectedResult[0].name);
      expect(result[0].practicalTitle).to.deep.equal(expectedResult[0].practicalTitle);
      expect(result[0].tutorials).to.have.lengthOf(2);
      expect(result[0].tutorials[0].id).to.deep.equal(expectedResult[0].tutorials[0].id);
      expect(result[0].tutorials[1].id).to.deep.equal(expectedResult[0].tutorials[1].id);

      expect(result[1].name).to.deep.equal(expectedResult[1].name);
      expect(result[1].practicalTitle).to.deep.equal(expectedResult[1].practicalTitle);
      expect(result[1].tutorials).to.have.lengthOf(1);
      expect(result[1].tutorials[0].id).to.deep.equal(expectedResult[1].tutorials[0].id);
    });

    it('returns an empty array when there is no tutorials', function () {
      // given
      const tutorials = [];
      const scorecard = EmberObject.create({ tutorials });
      const component = createGlimmerComponent('component:scorecard-details', { scorecard });

      const expectedResult = [];

      // when
      const result = component.tutorialsGroupedByTubeName;

      // then
      expect(result).to.deep.equal(expectedResult);
      expect(result).to.have.lengthOf(0);
    });
  });

  describe('#improveCompetenceEvaluation', function () {
    const competenceId = 'recCompetenceId';
    const userId = 'userId';
    const scorecardId = 'scorecardId';
    const scorecard = EmberObject.create({ competenceId, id: scorecardId });
    let competenceEvaluation, component;

    it('calls competenceEvaluation service for improving', async function () {
      // given
      component = createGlimmerComponent('component:scorecard-details', { scorecard });
      competenceEvaluation = Service.create({ improve: sinon.stub() });
      component.currentUser = EmberObject.create({ user: { id: userId } });
      component.competenceEvaluation = competenceEvaluation;

      // when
      await component.improveCompetenceEvaluation();

      // then
      sinon.assert.calledWith(competenceEvaluation.improve, { userId, competenceId, scorecardId });
    });
  });
});
