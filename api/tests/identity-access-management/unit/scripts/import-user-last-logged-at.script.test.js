import * as url from 'node:url';

import sinon from 'sinon';

import { ImportUserLastLogeedAtScript } from '../../../../src/identity-access-management/scripts/import-user-last-logged-at.script.js';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

describe('ImportUserLAstLogeedAtScript', function () {
  describe('Options', function () {
    it('parses CSV file correctly', async function () {
      // given
      const testCsvFile = `${currentDirectory}files/new-update-last-logged-at.csv`;
      const script = new ImportUserLastLogeedAtScript();

      // when
      const { options } = script.metaInfo;
      const fileData = await options.file.coerce(testCsvFile);

      // then
      expect(fileData).to.deep.equal([
        { userId: 1234, last_activity: new Date('2017-09-05T14:00:08Z') },
        { userId: 4567, last_activity: new Date('2018-03-02T15:26:16Z') },
      ]);
    });
  });

  describe('#handle', function () {
    let script;
    let importUserLastLoggedAt;
    let logger;

    beforeEach(function () {
      script = new ImportUserLastLogeedAtScript();
      importUserLastLoggedAt = sinon.stub();
      logger = { info: sinon.stub() };
    });

    it('runs the script', async function () {
      // given
      const file = [
        { userId: 1234, last_activity: '2017-09-05 14:00:08+0000' },
        { userId: 4567, last_activity: '2018-03-02 15:26:16+0000' },
      ];

      // when
      await script.handle({ options: { file, dryRun: true }, importUserLastLoggedAt, logger });

      // then
      expect(importUserLastLoggedAt).to.have.been.calledWith({
        dryRun: true,
        userId: 1234,
        lastActivity: '2017-09-05 14:00:08+0000',
      });
      expect(importUserLastLoggedAt).to.have.been.calledWith({
        dryRun: true,
        userId: 4567,
        lastActivity: '2018-03-02 15:26:16+0000',
      });
    });
  });
});
