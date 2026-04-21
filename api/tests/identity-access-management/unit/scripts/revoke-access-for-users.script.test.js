import * as url from 'node:url';

import sinon from 'sinon';

import { RevokeAccessForUsersScript } from '../../../../src/identity-access-management/scripts/revoke-access-for-users.script.js';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

describe('RevokeAccessForUsersScript', function () {
  describe('Options', function () {
    it('parses CSV file correctly', async function () {
      // given
      const testCsvFile = `${currentDirectory}files/revoked-access-for-users.csv`;
      const script = new RevokeAccessForUsersScript();

      // when
      const { options } = script.metaInfo;
      const fileData = await options.file.coerce(testCsvFile);

      // then
      expect(fileData).to.deep.equal([{ userId: 1 }, { userId: 2 }, { userId: 1234 }]);
    });
  });

  describe('#handle', function () {
    let script;
    let logger;
    let revokeAccessForUsers;

    beforeEach(function () {
      script = new RevokeAccessForUsersScript();
      logger = { info: sinon.spy() };
      revokeAccessForUsers = sinon.stub();
    });

    it('runs the script', async function () {
      // given
      const file = [{ userId: 1 }, { userId: 2 }, { userId: 3 }];

      // when
      await script.handle({ options: { file, batchSize: 2 }, logger, revokeAccessForUsers });

      // then
      expect(revokeAccessForUsers).to.have.been.calledWith({ userIds: [1, 2] });
      expect(revokeAccessForUsers).to.have.been.calledWith({ userIds: [3] });
      expect(logger.info).to.have.been.calledWith('3 users access revoked.');
    });

    it('runs the script with dry run mode', async function () {
      // given
      const file = [1, 2, 3];

      // when
      await script.handle({ options: { file, dryRun: true }, logger, revokeAccessForUsers });

      // then
      expect(revokeAccessForUsers).to.not.have.been.called;
      expect(logger.info).to.have.been.calledWith('3 users access to be revoked.');
    });
  });
});
