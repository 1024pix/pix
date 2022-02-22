const { expect, sinon } = require('../../../test-helper');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');
const challengeDatasource = require('../../../../lib/infrastructure/datasources/learning-content/challenge-datasource');
const skillDatasource = require('../../../../lib/infrastructure/datasources/learning-content/skill-datasource');

describe('Unit | Repository | challenge-repository', function () {
  beforeEach(function () {
    sinon.stub(challengeDatasource, 'get');
    sinon.stub(skillDatasource, 'get');
  });

  describe('#get', function () {
    it('returns a challenge by id with a skill', async function () {
      challengeDatasource.get.resolves({});
      skillDatasource.get.resolves({});
      const challenge = await challengeRepository.get('myid');
      expect(challenge).to.be.ok;
      expect(challenge.skill).to.be.ok;
    });

    it('returns a challenge by id with no skill', async function () {
      challengeDatasource.get.resolves({});
      skillDatasource.get.resolves(null);
      const challenge = await challengeRepository.get('myid');
      expect(challenge).to.be.ok;
      expect(challenge.skill).to.be.null;
    });
  });
});
