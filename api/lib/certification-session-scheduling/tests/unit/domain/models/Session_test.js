const { expect } = require('../../../../../../tests/test-helper.js');
const buildSession = require('../../../tooling/buildSession');

describe('Unit | Domain | Models | Session', () => {

  describe('#toDTO ', () => {

    it('should return the session as DTO', () => {
      // given
      const session = buildSession.withAccessCode({
        id: 123,
        certificationCenterId: 456,
        certificationCenterName: 'Centre de poux libérés',
        accessCodeValue: 'TOTO78',
        address: '1 rue des fruits exotiques',
        examiner: 'Clément',
        room: '2A',
        date: '2021-01-03',
        time: '14:30',
        description: 'La clé de la salle est sous le paillasson',
      });

      // when
      const sessionDTO = session.toDTO();

      // then
      expect(sessionDTO).to.deep.equal({
        id: 123,
        certificationCenterId: 456,
        certificationCenterName: 'Centre de poux libérés',
        accessCode: 'TOTO78',
        address: '1 rue des fruits exotiques',
        examiner: 'Clément',
        room: '2A',
        date: '2021-01-03',
        time: '14:30',
        description: 'La clé de la salle est sous le paillasson',
      });
    });
  });
});
