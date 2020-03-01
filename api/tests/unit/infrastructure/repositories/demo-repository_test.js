const { expect, sinon } = require('../../../test-helper');

const demoRepository = require('../../../../lib/infrastructure/repositories/demo-repository');
const Demo = require('../../../../lib/domain/models/Demo');
const demoDatasource = require('../../../../lib/infrastructure/datasources/airtable/demo-datasource');

describe('Unit | Repository | demo-repository', function() {

  describe('#get', function() {

    beforeEach(() => {
      sinon.stub(demoDatasource, 'get')
        .withArgs('recTest1')
        .resolves({
          id: 'recTest1',
          name: 'a-demo-name',
          adaptive: false,
          description: 'demo-description',
          imageUrl: 'http://example.org/demo.png',
          challenges: ['recChallenge1', 'recChallenge2'],
          competences: ['recCompetence'],
        });
    });

    it('should return Demo domain objects', async () => {
      // when
      const demo = await demoRepository.get('recTest1');

      // then
      expect(demo).to.be.an.instanceOf(Demo);
      expect(demo.id).to.equal('recTest1');
      expect(demo.name).to.equal('a-demo-name');
      expect(demo.type).to.equal('DEMO');
      expect(demo.description).to.equal('demo-description');
      expect(demo.imageUrl).to.equal('http://example.org/demo.png');
      expect(demo.challenges).to.deep.equal(['recChallenge1', 'recChallenge2']);
      expect(demo.competences).to.deep.equal(['recCompetence']);
    });

  });

  describe('#getDemoName', function() {

    beforeEach(() => {
      sinon.stub(demoDatasource, 'get')
        .withArgs('recTest2')
        .resolves({
          id: 'recTest2',
          name: 'a-demo-name',
        });
    });

    it('should return Demo domain objects', async () => {
      // when
      const demoName = await demoRepository.getDemoName('recTest2');

      // then
      expect(demoName).to.equal('a-demo-name');
    });

  });

});
