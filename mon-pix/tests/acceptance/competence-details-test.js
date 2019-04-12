import {
  afterEach,
  beforeEach,
  describe,
  it,
} from 'mocha';
import { expect } from 'chai';
import { authenticateAsPrescriber, authenticateAsSimpleUser } from '../helpers/testing';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import defaultScenario from '../../mirage/scenarios/default';

describe('Acceptance | Competence details | Afficher la page de detail d\'une compétence', () => {
  let application;

  beforeEach(() => {
    application = startApp();
    defaultScenario(server);
  });

  afterEach(() => {
    destroyApp(application);
  });

  describe('Authenticated cases as simple user', () => {
    beforeEach(async () => {
      await authenticateAsSimpleUser();
    });

    it('can visit /competence/foo', async () => {
      // when
      await visit('/competence/foo');

      // then
      expect(currentURL()).to.equal('/competence/foo');
    });

    it('displays the competence details', async () => {
      // given
      const name = 'Super compétence';
      const earnedPix = 7;
      const level = 4;
      const pixScoreAheadOfNextLevel = 10;
      const area = server.schema.areas.find(1);

      server.create('scorecard', {
        id: 'foo',
        name,
        earnedPix,
        level,
        pixScoreAheadOfNextLevel,
        area,
      });

      // when
      await visit('/competence/foo');

      // then
      expect(find('.competence-details__panel__inner__left__area').text()).to.contain(area.title);
      expect(find('.competence-details__panel__inner__left__name').text()).to.contain(name);
      expect(find('.competence-card-level__value').text()).to.contain(level);
      expect(find('.competence-details__panel__inner__right__score-container__pix-earned>div:first-child').text()).to.contain(earnedPix);
      expect(find('.competence-details__panel__inner__right__level-info').text()).to.contain(`${pixScoreAheadOfNextLevel} pix avant niveau ${level + 1}`);
      // TODO: description
    });

    it('Does not display pixScoreAheadOfNextLevel when next level is over the max level', async () => {
      // given
      server.create('scorecard', {
        id: 'foo',
        name: 'Super compétence',
        earnedPix: 7,
        level: 999,
        pixScoreAheadOfNextLevel: 10,
        area: server.schema.areas.find(1),
      });

      // when
      await visit('/competence/foo');

      // then
      expect(find('.competence-details__panel__inner__right__level-info')).to.have.lengthOf(0);
    });

  });

  describe('Authenticated cases as user with organization', () => {
    beforeEach(async () => {
      await authenticateAsPrescriber();
    });

    it('can visit /competence/foo', async () => {
      // when
      await visit('/competence/foo');

      // then
      expect(currentURL()).to.equal('/board');
    });
  });

  describe('Not authenticated cases', () => {
    it('should redirect to home, when user is not authenticated', async () => {
      // when
      await visit('/competence/foo');
      expect(currentURL()).to.equal('/connexion');
    });
  });
});
