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

async function authenticateAs(user) {
  await visit('/connexion');
  await fillIn('#email', user.email);
  await fillIn('#password', user.password);
  await click('.button');
}

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

    it('can visit /competence/1_1', async () => {
      // when
      await authenticateAsSimpleUser();
      await visit('/competence/1_1');

      // then
      expect(currentURL()).to.equal('/competence/1_1');
    });

    it('displays the competence details', async () => {
      // given
      const name = 'Super compétence';
      const earnedPix = 7;
      const level = 4;
      const pixScoreAheadOfNextLevel = 5;
      const area = server.schema.areas.find(1);

      const scorecard = server.create('scorecard', {
        id: '1_1',
        name,
        earnedPix,
        level,
        pixScoreAheadOfNextLevel,
        area,
      });

      // when
      await authenticateAsSimpleUser();
      await visit(`/competence/${scorecard.id}`);

      // then
      expect(find('.competence-details__panel__inner__left__area').text()).to.contain(area.title);
      expect(find('.competence-details__panel__inner__left__area').attr('class')).to.contain('competence-details--jaffa');
      expect(find('.competence-details__panel__inner__left__name').text()).to.contain(name);
      expect(find('.competence-card-level__value').text()).to.contain(level);
      expect(find('.competence-details__panel__inner__right__score-container__pix-earned>div:first-child').text()).to.contain(earnedPix);
      expect(find('.competence-details__panel__inner__right__level-info').text()).to.contain(`${pixScoreAheadOfNextLevel} pix avant niveau ${level + 1}`);
      expect(find('.competence-details__button').text()).to.contain('Démarrer');
      // TODO: description
    });

    it('Does not display pixScoreAheadOfNextLevel when next level is over the max level', async () => {
      // given
      const scorecard = server.create('scorecard', {
        id: '1_1',
        name: 'Super compétence',
        earnedPix: 7,
        level: 999,
        pixScoreAheadOfNextLevel: 5,
        area: server.schema.areas.find(1),
      });

      // when
      await authenticateAsSimpleUser();
      await visit(`/competence/${scorecard.id}`);

      // then
      expect(find('.competence-details__panel__inner__right__level-info')).to.have.lengthOf(0);
    });

    it('Displays "Continuer" when the competence is being assessed', async () => {
      // given
      const area = server.schema.areas.find(1);

      const competence = server.create('competence', {
        id: '111',
        status: 'assessmentNotCompleted',
      });

      const user = server.create('user', {
        id: 4,
        firstName: 'Joe',
        lastName: 'Doe',
        email: 'joe@acme.com',
        password: 'Competence123',
        cgu: true,
        recaptchaToken: 'recaptcha-token-xxxxxx',
        totalPixScore: 456,
        competenceIds: [competence.id],
      });

      const scorecard = server.create('scorecard', {
        id: `${user.id}_${competence.id}`,
        name: 'Super compétence',
        earnedPix: 7,
        level: 4,
        pixScoreAheadOfNextLevel: 6,
        area,
      });

      // when
      await authenticateAs(user);
      await visit(`/competence/${scorecard.id}`);

      // then
      expect(find('.competence-details__button').text()).to.contain('Continuer');
    });

    it('Displays "Progresser" in disabled state when the competence has been assessed and is not retryable', async () => {
      // given
      const area = server.schema.areas.find(1);

      const competence = server.create('competence', {
        id: '111',
        status: 'assessed',
        isRetryable: false,
      });

      const user = server.create('user', {
        id: 4,
        firstName: 'Joe',
        lastName: 'Doe',
        email: 'joe@acme.com',
        password: 'Competence123',
        cgu: true,
        recaptchaToken: 'recaptcha-token-xxxxxx',
        totalPixScore: 456,
        competenceIds: [competence.id],
      });

      const scorecard = server.create('scorecard', {
        id: `${user.id}_${competence.id}`,
        name: 'Super compétence',
        earnedPix: 7,
        level: 4,
        pixScoreAheadOfNextLevel: 6,
        area,
      });

      // when
      await authenticateAs(user);
      await visit(`/competence/${scorecard.id}`);

      // then
      expect(find('.competence-details__button').text()).to.contain('Progresser');
      expect(find('.competence-details__button').attr('disabled')).to.equal('disabled');
      expect(find('.competence-details__panel__inner__right__disponibility').text()).to.contain('Disponible dans 7 jours');
    });

    it('Displays "Progresser" in enabled state when the competence has been assessed and is retryable', async () => {
      // given
      const area = server.schema.areas.find(1);

      const competence = server.create('competence', {
        id: '111',
        status: 'assessed',
        isRetryable: true,
      });

      const user = server.create('user', {
        id: 4,
        firstName: 'Joe',
        lastName: 'Doe',
        email: 'joe@acme.com',
        password: 'Competence123',
        cgu: true,
        recaptchaToken: 'recaptcha-token-xxxxxx',
        totalPixScore: 456,
        competenceIds: [competence.id],
      });

      const scorecard = server.create('scorecard', {
        id: `${user.id}_${competence.id}`,
        name: 'Super compétence',
        earnedPix: 7,
        level: 4,
        pixScoreAheadOfNextLevel: 6,
        area,
      });

      // when
      await authenticateAs(user);
      await visit(`/competence/${scorecard.id}`);

      // then
      expect(find('.competence-details__button').text()).to.contain('Progresser');
      expect(find('.competence-details__button').attr('disabled')).to.be.undefined;
      expect(find('.competence-details__panel__inner__right__disponibility')).to.have.lengthOf(0);
    });

  });

  describe('Authenticated cases as user with organization', () => {
    beforeEach(async () => {
      await authenticateAsPrescriber();
    });

    it('can visit /competence/1_1', async () => {
      // when
      await visit('/competence/1_1');

      // then
      expect(currentURL()).to.equal('/board');
    });
  });

  describe('Not authenticated cases', () => {
    it('should redirect to home, when user is not authenticated', async () => {
      // when
      await visit('/competence/1_1');
      expect(currentURL()).to.equal('/connexion');
    });
  });
});
