const { expect, sinon } = require('../../../test-helper');
const airTableDataObjects = require('../../../../lib/infrastructure/datasources/airtable/objects');
const Tutorial = require('../../../../lib/domain/models/Tutorial');
const tutorialDatasource = require('../../../../lib/infrastructure/datasources/airtable/tutorial-datasource');
const tutorialRepository = require('../../../../lib/infrastructure/repositories/tutorial-repository');

describe('Unit | Repository | tutorial-repository', () => {

  const tutorialData1 = new airTableDataObjects.Tutorial({
    id: 'recTutorial1',
    duration: '00:01:30',
    format: 'video',
    link: 'https://youtube.fr',
    source: 'Youtube',
    title:'Comment dresser un panda',
  });

  describe('#get', () => {
    beforeEach(() => {
      // given
      sinon.stub(tutorialDatasource, 'get')
        .withArgs('recTutorial1')
        .resolves(tutorialData1);
    });

    it('should return a domain Tutorial object', async () => {
      // given
      const expectedTutorial = new Tutorial({
        id: 'recTutorial1',
        duration: '00:01:30',
        format: 'video',
        link: 'https://youtube.fr',
        source: 'Youtube',
        title:'Comment dresser un panda',
      });

      // when
      const fetchedTutorial = await tutorialRepository.get('recTutorial1');

      // then
      expect(fetchedTutorial).to.be.an.instanceOf(Tutorial);
      expect(fetchedTutorial).to.deep.equal(expectedTutorial);
    });
  });

});
