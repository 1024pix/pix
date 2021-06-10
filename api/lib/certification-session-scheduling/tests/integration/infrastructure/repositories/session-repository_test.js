const {
  expect,
  knex,
  databaseBuilder,
} = require('../../../../../../tests/test-helper');
const _ = require('lodash');
const buildSession = require('../../../tooling/buildSession');
const sessionRepository = require('../../../../infrastructure/repositories/session-repository');
const { Session } = require('../../../../domain/models/Session');

describe('Integration | Repositories | session', () => {

  afterEach(()=> {
    return databaseBuilder.clean();
  });

  describe('#get', () => {
    afterEach(() => {
      return knex('sessions').delete();
    });

    it('returns a session', async () => {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const expectedSession = buildSession.withAccessCode({
        id: 456,
        certificationCenterId,
        certificationCenterName: 'Centre des Anne-Etoiles',
        address: '18 rue Jean Dussourd',
        room: '204',
        accessCodeValue: 'AZER12',
        examiner: 'Julie Dupont',
        date: '2021-03-26',
        time: '12:00',
        description: 'Ma session',
      });
      databaseBuilder.factory.buildSession({
        id: 456,
        certificationCenterId,
        certificationCenter: 'Centre des Anne-Etoiles',
        address: '18 rue Jean Dussourd',
        room: '204',
        accessCode: 'AZER12',
        examiner: 'Julie Dupont',
        date: '2021-03-26',
        time: '12:00',
        description: 'Ma session',
      }).id;
      await databaseBuilder.commit();

      // when
      const actualSession = await sessionRepository.get(456);

      // then
      expect(actualSession).to.be.instanceOf(Session);
      expect(actualSession).to.deep.equal(expectedSession);
    });
  });

  describe('#save', () => {

    afterEach(() => {
      return knex('sessions').delete();
    });

    it('creates a new session when does not exist', async () => {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const sessionToSave = buildSession.withAccessCode({
        id: null,
        certificationCenterId,
        certificationCenterName: 'Centre des Anne-Etoiles',
        address: '18 rue Jean Dussourd',
        room: '204',
        accessCodeValue: 'AZER12',
        examiner: 'Julie Dupont',
        date: '2021-03-26',
        time: '12:00',
        description: 'Ma session',
      });
      await databaseBuilder.commit();

      // when
      const savedSessionId = await sessionRepository.save(sessionToSave);

      // then
      const savedSession = await sessionRepository.get(savedSessionId);
      expect(_.omit(savedSession.toDTO(), ['id'])).to.deep.equal(_.omit(sessionToSave.toDTO(), ['id']));
      expect(savedSession.toDTO().id).to.equal(savedSessionId);
    });
  });
});
