import _ from 'lodash';

import { tutorialDatasource } from '../../../../../src/devcomp/infrastructure/datasources/learning-content/tutorial-datasource.js';
import { expect, mockLearningContent } from '../../../../test-helper.js';

describe('Integration | Infrastructure | Datasource | Learning Content | TutorialDatasource', function () {
  describe('#findByRecordIds', function () {
    it('should return an array of tutorial data objects', async function () {
      // given
      const rawTutorial1 = { id: 'FAKE_REC_ID_RAW_TUTORIAL_1' };
      const rawTutorial2 = { id: 'FAKE_REC_ID_RAW_TUTORIAL_2' };
      const rawTutorial3 = { id: 'FAKE_REC_ID_RAW_TUTORIAL_3' };
      const records = [rawTutorial1, rawTutorial2, rawTutorial3];
      const lcmsApiCall = await mockLearningContent({ tutorials: records });

      // when
      const foundTutorials = await tutorialDatasource.findByRecordIds([rawTutorial1.id, rawTutorial3.id]);

      // then
      expect(foundTutorials).to.be.an('array');
      expect(_.map(foundTutorials, 'id')).to.deep.equal([rawTutorial1.id, rawTutorial3.id]);
      expect(lcmsApiCall.isDone()).to.be.true;
    });
  });
});
