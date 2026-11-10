import { expect } from 'chai';

import { ParticipantRepartition } from '../../../../../../src/prescription/organization-learner/domain/models/ParticipantRepartition.js';

describe('Unit | Domain | Models | ParticipantRepartition', function () {
  it('counts the number of registred users', function () {
    // given & when
    const participantList = [{ isAnonymous: true }, { isAnonymous: false }, { isAnonymous: false }];
    const participantRepartition = new ParticipantRepartition(participantList);
    // then
    expect(participantRepartition.totalRegisteredParticipant).to.equal(2);
  });

  it('counts the number of not registred users', function () {
    // given & when
    const participantList = [{ isAnonymous: true }, { isAnonymous: false }, { isAnonymous: false }];
    const participantRepartition = new ParticipantRepartition(participantList);
    // then
    expect(participantRepartition.totalUnRegisteredParticipant).to.equal(1);
  });

  describe('#fromCounts', function () {
    it('builds a repartition from already computed counts', function () {
      // when
      const participantRepartition = ParticipantRepartition.fromCounts({
        totalRegisteredParticipant: 3,
        totalUnRegisteredParticipant: 2,
      });

      // then
      expect(participantRepartition).to.be.instanceOf(ParticipantRepartition);
      expect(participantRepartition.totalRegisteredParticipant).to.equal(3);
      expect(participantRepartition.totalUnRegisteredParticipant).to.equal(2);
    });

    it('defaults counts to 0', function () {
      // when
      const participantRepartition = ParticipantRepartition.fromCounts();

      // then
      expect(participantRepartition.totalRegisteredParticipant).to.equal(0);
      expect(participantRepartition.totalUnRegisteredParticipant).to.equal(0);
    });
  });
});
