import _ from 'lodash';
import { expect, sinon } from '../../../../test-helper';
import lcms from '../../../../../lib/infrastructure/lcms';
import tutorialDatasource from '../../../../../lib/infrastructure/datasources/learning-content/tutorial-datasource';
import cache from '../../../../../lib/infrastructure/caches/learning-content-cache';

describe('Unit | Infrastructure | Datasource | Learning Content | TutorialDatasource', function () {
  beforeEach(function () {
    sinon.stub(cache, 'get').callsFake((generator) => generator());
  });

  describe('#findByRecordIds', function () {
    it('should return an array of tutorial data objects', function () {
      // given
      const rawTutorial1 = { id: 'FAKE_REC_ID_RAW_TUTORIAL_1' };
      const rawTutorial2 = { id: 'FAKE_REC_ID_RAW_TUTORIAL_2' };
      const rawTutorial3 = { id: 'FAKE_REC_ID_RAW_TUTORIAL_3' };
      const records = [rawTutorial1, rawTutorial2, rawTutorial3];
      sinon.stub(lcms, 'getLatestRelease').resolves({ tutorials: records });

      // when
      const promise = tutorialDatasource.findByRecordIds([rawTutorial1.id, rawTutorial3.id]);

      // then
      return promise.then((foundTutorials) => {
        expect(foundTutorials).to.be.an('array');
        expect(_.map(foundTutorials, 'id')).to.deep.equal([rawTutorial1.id, rawTutorial3.id]);
        expect(lcms.getLatestRelease).to.have.been.called;
      });
    });
  });
});
