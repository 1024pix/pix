const { expect, mockLearningContent } = require('../../../test-helper');
const missionRepository = require('../../../../lib/infrastructure/repositories/mission-repository');
const Mission = require('../../../../lib/domain/models/Mission');

describe('Integration | Repository | mission-repository', function () {
  describe('#get', function () {
    it('should return the correct mission with FR default language', async function () {
      // given
      const expectedMission = new Mission({
        id: 'recThematic1',
        name: 'nameThemaFR1',
      });

      mockLearningContent({
        thematics: [
          {
            id: 'recThematic1',
            name_i18n: { fr: 'nameThemaFR1' },
          },
        ],
      });

      // when
      const mission = await missionRepository.get('recThematic1');

      // then
      expect(mission).to.deep.equal(expectedMission);
    });
  });
});
