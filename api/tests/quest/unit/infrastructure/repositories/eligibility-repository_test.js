import sinon from 'sinon';

import { Eligibility } from '../../../../../src/quest/domain/models/Eligibility.js';
import * as organizationLearnersWithParticipationsRepository from '../../../../../src/quest/infrastructure/repositories/eligibility-repository.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Infrastructure | repositories | eligibility', function () {
  describe('#find', function () {
    it('should call organizationLearnersWithParticipations api', async function () {
      // given
      const mefCode = Symbol('organizationLearnerMefCode');
      const organization = Symbol('organization');
      const targetProfileId = Symbol('targetProfileId');
      const apiResponseSymbol = [
        {
          organizationLearner: {
            MEFCode: mefCode,
          },
          organization,
          campaignParticipations: [{ targetProfileId }],
        },
      ];
      const userId = 1;
      const organizationLearnerWithParticipationApi = {
        find: sinon.stub(),
      };
      organizationLearnerWithParticipationApi.find.withArgs({ userIds: [userId] }).resolves(apiResponseSymbol);

      // when
      const result = await organizationLearnersWithParticipationsRepository.find({
        userId,
        organizationLearnerWithParticipationApi,
      });

      // then
      expect(result[0]).to.be.an.instanceof(Eligibility);
      expect(result[0].organization).to.equal(organization);
      expect(result[0].campaignParticipations[0].targetProfileId).to.equal(targetProfileId);
      expect(result[0].organizationLearner.MEFCode).to.equal(mefCode);
    });
  });
});
