import sinon from 'sinon';

import { Script } from '../../../../../src/shared/application/scripts/script.js';
import { ScriptRunner } from '../../../../../src/shared/application/scripts/script-runner.js';
import { logger, loggerPino } from '../../../../../src/shared/infrastructure/utils/logger.js';
import { expect } from '../../../../test-helper.js';

describe('Shared | Unit | Application | ScriptRunner', function () {
  let scriptFileUrl;
  let scriptRunStub;
  let ScriptClass;
  let isRunningFromCli;
  let loggerInfoSpy, loggerErrorSpy;
  let getProcessArgs;
  let releaseInfrastructure;

  beforeEach(function () {
    scriptFileUrl = 'file://script.js';
    isRunningFromCli = sinon.stub();
    loggerInfoSpy = sinon.spy(logger, 'info');
    loggerErrorSpy = sinon.spy(logger, 'error');
    getProcessArgs = sinon.stub();
    releaseInfrastructure = sinon.stub().resolves();
    scriptRunStub = sinon.stub();
    ScriptClass = class MyTestScript extends Script {
      constructor() {
        super({
          description: 'Test script',
          permanent: true,
          options: { verbose: { type: 'boolean', default: false } },
          commands: {
            pouet: {
              description: 'la commande pouet',
              options: { volume: { type: 'integer', default: 11 } },
            },
          },
        });
      }
      async run(...args) {
        return scriptRunStub(...args);
      }
    };
  });

  it('runs in a dedicated context and attach correlation information', async function () {
    // given
    isRunningFromCli.returns(true);
    scriptRunStub.resolves();
    getProcessArgs.returns(['--verbose', 'pouet', '--volume', '666']);
    const loggerPinoChildSpy = sinon.spy(loggerPino, 'child');

    // when
    await ScriptRunner.execute(scriptFileUrl, ScriptClass, { isRunningFromCli, getProcessArgs, releaseInfrastructure });

    // then
    expect(
      loggerPinoChildSpy.calledWithMatch(
        sinon.match({
          scriptId: sinon.match.string,
        }),
      ),
    ).to.be.true;
  });

  context('when not running from CLI', function () {
    beforeEach(function () {
      isRunningFromCli.returns(false);
    });

    it('does not run the script', async function () {
      // given

      // when
      await ScriptRunner.execute(scriptFileUrl, ScriptClass, {
        isRunningFromCli,
        getProcessArgs,
        releaseInfrastructure,
      });

      // then
      expect(loggerInfoSpy).not.to.have.been.called;
      expect(loggerErrorSpy).not.to.have.been.called;
      expect(releaseInfrastructure).not.to.have.been.called;
    });
  });

  context('when running from CLI', function () {
    beforeEach(function () {
      isRunningFromCli.returns(true);
    });

    it('parses process args and runs the script', async function () {
      // given
      scriptRunStub.resolves();
      getProcessArgs.returns(['--verbose', 'pouet', '--volume', '666']);

      // when
      await ScriptRunner.execute(scriptFileUrl, ScriptClass, {
        isRunningFromCli,
        getProcessArgs,
        releaseInfrastructure,
      });

      // then
      expect(loggerInfoSpy).to.have.been.calledWith('Start script');
      expect(scriptRunStub).to.have.been.calledWith({
        command: 'pouet',
        options: { verbose: true, volume: 666 },
        logger,
      });
      expect(loggerInfoSpy).to.have.been.calledWith('Script execution successful.');
      expect(releaseInfrastructure).to.have.been.calledOnce;
    });

    context('when an error occurs in the script', function () {
      it('handles errors during script execution and log failure', async function () {
        // given
        scriptRunStub.rejects(new Error('Error!!!'));
        getProcessArgs.returns([]);

        // when
        await ScriptRunner.execute(scriptFileUrl, ScriptClass, {
          isRunningFromCli,
          getProcessArgs,
          releaseInfrastructure,
        });

        // then
        expect(scriptRunStub).to.have.been.calledOnce;
        expect(loggerErrorSpy).to.have.been.calledWith('Script execution failed.');
        expect(loggerErrorSpy).to.have.been.calledWithMatch(sinon.match.instanceOf(Error));
        expect(process.exitCode).to.equal(1);
        expect(releaseInfrastructure).to.have.been.calledOnce;
      });
    });
  });
});
