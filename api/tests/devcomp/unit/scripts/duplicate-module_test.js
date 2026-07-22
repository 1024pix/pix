import fs from 'node:fs';

import sinon from 'sinon';

import { DuplicateModule } from '../../../../src/devcomp/scripts/duplicate-module.js';
import { expect } from '../../../test-helper.js';
import { catchErr } from '../../../tooling/test-utils/error.js';

describe('Unit | Scripts | Duplicate Module', function () {
  describe('DuplicateModule', function () {
    describe('#handle', function () {
      afterEach(function () {
        sinon.restore();
      });

      it('should read the source module, duplicate it, and write the result next to it', async function () {
        // given
        const moduleData = {
          id: '6282925d-4775-4bca-b513-4c3009ec5886',
          slug: 'bac-a-sable',
          title: 'Bac à sable',
          shortId: '6a68bf32',
        };
        sinon.stub(fs, 'existsSync').callsFake((path) => path.endsWith('bac-a-sable.json'));
        sinon.stub(fs, 'readFileSync').returns(JSON.stringify(moduleData));
        sinon.stub(fs, 'writeFileSync');
        const logger = { info: sinon.stub() };
        const script = new DuplicateModule();

        // when
        await script.handle({ options: { source: 'bac-a-sable.json' }, logger });

        // then
        // eslint-disable-next-line n/no-sync
        expect(fs.readFileSync).to.have.been.calledWith(sinon.match(/bac-a-sable\.json$/), 'utf-8');
        const [writtenPath, writtenContent] = fs.writeFileSync.firstCall.args;
        expect(writtenPath).to.match(/bac-a-sable_copie\.json$/);
        const writtenModuleData = JSON.parse(writtenContent);
        expect(writtenModuleData.slug).to.equal('bac-a-sable-copie');
        expect(writtenModuleData.title).to.equal('Bac à sable (copie)');
        expect(writtenModuleData.id).to.not.equal(moduleData.id);
      });

      it('should log the created file path and a reminder to run modulix:test', async function () {
        // given
        const moduleData = {
          id: '6282925d-4775-4bca-b513-4c3009ec5886',
          slug: 'bac-a-sable',
          title: 'Bac à sable',
          shortId: '6a68bf32',
        };
        sinon.stub(fs, 'existsSync').callsFake((path) => path.endsWith('bac-a-sable.json'));
        sinon.stub(fs, 'readFileSync').returns(JSON.stringify(moduleData));
        sinon.stub(fs, 'writeFileSync');
        const logger = { info: sinon.stub() };
        const script = new DuplicateModule();

        // when
        await script.handle({ options: { source: 'bac-a-sable.json' }, logger });

        // then
        expect(logger.info).to.have.been.calledWith(sinon.match(/^Module dupliqué : .*bac-a-sable_copie\.json$/));
        expect(logger.info).to.have.been.calledWith(
          'Pensez à lancer "npm run modulix:test" pour valider le nouveau module.',
        );
      });

      it('should throw when the source file does not exist', async function () {
        // given
        sinon.stub(fs, 'existsSync').returns(false);
        const logger = { info: sinon.stub() };
        const script = new DuplicateModule();

        // when
        const err = await catchErr(script.handle.bind(script))({ options: { source: 'missing.json' }, logger });

        // then
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.match(/n'existe pas\.$/);
      });

      it('should throw when the target file already exists', async function () {
        // given
        const moduleData = {
          id: '6282925d-4775-4bca-b513-4c3009ec5886',
          slug: 'bac-a-sable',
          title: 'Bac à sable',
          shortId: '6a68bf32',
        };
        sinon.stub(fs, 'existsSync').returns(true);
        sinon.stub(fs, 'readFileSync').returns(JSON.stringify(moduleData));
        const logger = { info: sinon.stub() };
        const script = new DuplicateModule();

        // when
        const err = await catchErr(script.handle.bind(script))({ options: { source: 'bac-a-sable.json' }, logger });

        // then
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.match(/existe déjà\.$/);
      });
    });
  });
});
