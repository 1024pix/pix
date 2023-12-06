import { expect, mockLearningContent, catchErr } from '../../../../test-helper.js';
import * as missionRepository from '../../../../../src/school/infrastructure/repositories/mission-repository.js';
import { Mission } from '../../../../../src/school/domain/models/Mission.js';
import { NotFoundError } from '../../../../../lib/domain/errors.js';
describe('Integration | Repository | mission-repository', function () {
  describe('#get', function () {
    context('when there is a mission for the given id', function () {
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
    context('when there is no mission for the given id', function () {
      it('should return the not found error', async function () {
        // given
        mockLearningContent({
          thematics: [],
        });
        const missionId = 'recThematic1';
        // when
        const error = await catchErr(missionRepository.get)(missionId);

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.deep.equal(`Il n'existe pas de mission ayant pour id ${missionId}`);
      });
    });
  });
});
