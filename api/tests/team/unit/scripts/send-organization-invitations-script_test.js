import * as url from 'node:url';

import { SendOrganizationInvitationsScript } from '../../../../src/team/scripts/send-organization-invitations-script.js';
import { expect, sinon } from '../../../test-helper.js';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

describe('unit | team | scripts | send-organization-invitations-script', function () {
  describe('options', function () {
    it('Check the csv parser', async function () {
      // given
      const testCsvFile = `${currentDirectory}files/send-organization-invitations.csv`;
      const script = new SendOrganizationInvitationsScript();

      // when
      const { options } = script.metaInfo;
      const fileData = await options.file.coerce(testCsvFile);

      // then
      expect(fileData).to.be.deep.equal([
        { 'Organization ID': 1, email: 'test@example.net', locale: 'fr', role: 'MEMBER' },
      ]);
    });
  });

  describe('#handle', function () {
    let file;
    let script;
    let logger;
    let sendOrganizationInvitation;

    beforeEach(function () {
      file = [
        { 'Organization Id': 1, email: 'test1@example.net', locale: 'fr', role: 'MEMBER' },
        { 'Organization Id': 2, email: 'test2@example.net', locale: 'en', role: 'ADMIN' },
        { 'Organization Id': 3, email: 'test3@example.net', locale: 'fr', role: 'MEMBER' },
      ];
      script = new SendOrganizationInvitationsScript();
      logger = { info: sinon.spy() };
      sendOrganizationInvitation = sinon.stub();
    });

    it('Runs the script', async function () {
      // when
      await script.handle({
        options: { file },
        logger,
        sendOrganizationInvitation,
      });

      // then
      expect(sendOrganizationInvitation).to.have.callCount(3);
      expect(sendOrganizationInvitation).to.have.calledWith({
        organizationId: file[0]['Organization ID'],
        email: file[0].email,
        locale: file[0].locale,
        role: file[0].role,
      });
    });

    it('runs the script and replace empty role by null', async function () {
      // given
      const file = [{ 'Organization ID': 1, email: 'test@example.net', locale: 'fr' }];

      // when
      await script.handle({
        options: { file },
        logger,
        sendOrganizationInvitation,
      });

      // then
      expect(sendOrganizationInvitation).to.have.been.calledWith({
        organizationId: 1,
        email: 'test@example.net',
        locale: 'fr',
        role: null,
      });
    });

    it('Runs the script with batch', async function () {
      // when
      await script.handle({
        options: { file, batchSize: 1 },
        logger,
        sendOrganizationInvitation,
      });

      // then
      expect(logger.info).to.have.been.calledWith('Batch #1');
      expect(logger.info).to.have.been.calledWith('Batch #2');
      expect(logger.info).to.have.been.calledWith('Batch #3');
    });

    it('runs the script with dryRun', async function () {
      // when
      await script.handle({
        options: { file, dryRun: true },
        logger,
        sendOrganizationInvitation,
      });

      // then
      expect(logger.info).to.have.been.calledWith('Dry run, no action');
      expect(sendOrganizationInvitation).to.not.have.been.called;
    });
  });
});
