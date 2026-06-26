import { UserCompetence } from '../../../../../src/shared/domain/models/UserCompetence.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Domain | Models | UserCompetence', function () {
  describe('#isCertifiable', function () {
    it('should return false when the user competence is not certifiable', function () {
      // given
      const userCompetence = new UserCompetence({ estimatedLevel: 0 });

      // when
      const result = userCompetence.isCertifiable();

      // then
      expect(result).to.be.false;
    });

    it('should return false when the user competence is certifiable', function () {
      // given
      const userCompetence = new UserCompetence({ estimatedLevel: 1 });

      // when
      const result = userCompetence.isCertifiable();

      // then
      expect(result).to.be.true;
    });
  });
});
