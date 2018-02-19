const { expect, nock } = require('../../test-helper');
const server = require('../../../server');

describe('Acceptance | API | ChallengeController', function() {

  after(function(done) {
    server.stop(done);
  });

  describe('GET /api/challenges/:challenge_id', function() {

    before(function(done) {
      nock.cleanAll();
      nock('https://api.airtable.com')
        .get('/v0/test-base/Epreuves/recLt9uwa2dR3IYpi')
        .query(true)
        .times(3)
        .reply(200, {
          'id': 'recLt9uwa2dR3IYpi',
          'fields': {
            'Consigne': 'Que peut-on dire des œufs de catégorie A ?\n',
            'description': 'catégorie oeuf',
            'domaine': '1. Information et données',
            'compétence': '1.1. Mener une recherche d\'information',
            'acquis': [
              '#menerUneRecherche'
            ],
            'Propositions': '- Ils sont bio.\n- Ils pèsent plus de 63 grammes.\n- Ce sont des oeufs frais.\n- Ils sont destinés aux consommateurs.\n- Ils ne sont pas lavés.\n',
            'id': 1,
            'Type d\'épreuve': 'QCM',
            'Tests': [
              'recgfTczeaXYoBLpw'
            ],
            'Reponses': [
              'rec9jYnyhKVY8GfzT',
              'recUGVxm7trYNtrd6',
              'rec26WCyBU11QqnC2'
            ],
            '_Preview Temp': 'https://docs.google.com/presentation/d/11gVqLG0a6lCd-Vpw23nJGXGkxN-78B_nNnoMO4Xlui8/edit#slide=id.g147b5b7b8e_0_124',
            '_Statut': 'validé',
            'Bonnes réponses': '3, 4, 5',
            '_Niveau': [
              '3'
            ],
            'Type péda': 'e-preuve',
            'Auteur': [
              'NDE'
            ],
            'Déclinable': 'facilement',
            'Internet et outils': 'Non',
            'Prototype d\'épreuve': 'oui',
            'Record ID': 'recLt9uwa2dR3IYpi',
            'Preview': 'http://development.pix.beta.gouv.fr/challenges/recLt9uwa2dR3IYpi/preview'
          },
          'createdTime': '2016-08-09T09:08:57.000Z'
        });
      done();
    });

    after(function(done) {
      nock.cleanAll();
      done();
    });

    const options = { method: 'GET', url: '/api/challenges/recLt9uwa2dR3IYpi' };

    it('should return 200 HTTP status code', function(done) {
      server.inject(options, (response) => {
        expect(response.statusCode).to.equal(200);
        done();
      });
    });

    it('should return application/json', function(done) {
      server.inject(options, (response) => {
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
        done();
      });
    });

    it('should return the expected challenge', function(done) {
      server.inject(options, (response) => {
        const challenge = response.result.data;
        expect(challenge.id).to.equal('recLt9uwa2dR3IYpi');
        expect(challenge.attributes.instruction).to.equal('Que peut-on dire des œufs de catégorie A ?\n');
        expect(challenge.attributes.proposals).to.equal('- Ils sont bio.\n- Ils pèsent plus de 63 grammes.\n- Ce sont des oeufs frais.\n- Ils sont destinés aux consommateurs.\n- Ils ne sont pas lavés.\n');
        expect(challenge.attributes.type).to.equal('QCM');
        expect(challenge.attributes['hasnt-internet-allowed']).to.equal(true);
        done();
      });
    });

  });

});
