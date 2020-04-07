import { click, find } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticateByEmail } from '../helpers/authentification';
import visit from '../helpers/visit';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Tutorial | Save', function() {
  setupApplicationTest();
  setupMirage();
  let user;
  let firstScorecard;
  let competenceNumber;
  let competenceId;

  beforeEach(async function() {
    user = server.create('user', 'withEmail');
    await authenticateByEmail(user);

    //given
    firstScorecard = user.scorecards.models[0];
    competenceId = firstScorecard.competenceId;
    const splitIndex = firstScorecard.index.split('.');
    competenceNumber = splitIndex[splitIndex.length - 1];
    const assessment = server.create('assessment', 'ofCompetenceEvaluationType');
    server.create('challenge', 'forCompetenceEvaluation', 'QCM');
    server.create('competence-evaluation', { user, competenceId, assessment });
  });

  describe('Authenticated cases as simple user', function() {

    it('displays tutorial item in competence page', async function() {
      // when
      await visit('/profil');
      await click(`.rounded-panel-body__areas:nth-child(${firstScorecard.area.code}) .rounded-panel-body__competence-card:nth-child(${competenceNumber}) .competence-card__header`);

      // then
      expect(find('.tutorial__content')).to.exist;
    });

  });
});
