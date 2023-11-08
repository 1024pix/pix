import { databaseBuilder, expect } from '../../../../../test-helper.js';
import * as sessionForSupervisorKitRepository from '../../../../../../src/certification/session/infrastructure/repositories/session-for-supervisor-kit-repository.js';
import { SessionForSupervisorKit } from '../../../../../../src/certification/session/domain/read-models/SessionForSupervisorKit.js';

describe('Integration | Repository | Session-for-supervisor-kit', function () {
  describe('#get', function () {
    context('when session exists', function () {
      it('should return session main information', async function () {
        // given
        databaseBuilder.factory.buildOrganization({ externalId: 'EXT1234', isManagingStudents: true });
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter({
          name: 'Tour Gamma',
          type: 'SCO',
          externalId: 'EXT1234',
        });

        const session = databaseBuilder.factory.buildSession({
          id: 1234,
          certificationCenter: 'Tour Gamma',
          certificationCenterId: certificationCenter.id,
          address: 'rue de Bercy',
          room: 'Salle A',
          examiner: 'Monsieur Examinateur',
          date: '2018-02-23',
          time: '12:00:00',
          accessCode: 'X23SR71',
          supervisorPassword: 'NYX34',
        });

        await databaseBuilder.commit();

        const expectedSessionValues = new SessionForSupervisorKit({
          id: 1234,
          certificationCenterName: 'Tour Gamma',
          address: 'rue de Bercy',
          room: 'Salle A',
          examiner: 'Monsieur Examinateur',
          date: '2018-02-23',
          time: '12:00:00',
          accessCode: 'X23SR71',
          supervisorPassword: 'NYX34',
          version: 2,
        });

        // when
        const actualSession = await sessionForSupervisorKitRepository.get(session.id);

        // then
        expect(actualSession).to.deepEqualInstance(expectedSessionValues);
      });
    });
  });
});
