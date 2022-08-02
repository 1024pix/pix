const { expect, sinon } = require('../../../../test-helper');
const trainingDatasource = require('../../../../../lib/infrastructure/datasources/learning-content/training-datasource');
const lcms = require('../../../../../lib/infrastructure/lcms');

describe('Unit | Infrastructure | Datasource | Learning Content | TrainingDatasource', function () {
  describe('#list', function () {
    it('should return an array of learning content trainings data objects', async function () {
      // given
      const records = [{ id: 1 }, { id: 2 }, { id: 3 }];
      sinon.stub(lcms, 'getLatestRelease').resolves({ trainings: records });

      // when
      const foundTrainings = await trainingDatasource.list();

      // then
      expect(foundTrainings).to.deep.equal(records);
    });
  });
});
