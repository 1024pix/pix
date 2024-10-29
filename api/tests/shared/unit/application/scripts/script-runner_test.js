import { disconnect } from '../../../../../db/knex-database-connection.js';
import { Script } from '../../../../../src/shared/application/scripts/script.js';
import { ScriptRunner } from '../../../../../src/shared/application/scripts/script-runner.js';
import { learningContentCache } from '../../../../../src/shared/infrastructure/caches/learning-content-cache.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Shared | Unit | Application | ScriptRunner', function () {
  let scriptFileUrl;
  let scriptRunStub;
  let ScriptClass;
  let logger;

  beforeEach(function () {
    scriptFileUrl = 'file://script.js';
    logger = { info: sinon.stub(), error: sinon.stub() };
    scriptRunStub = sinon.stub();
    ScriptClass = class extends Script {
      constructor() {
        super({
          description: 'Test script',
          permanent: true,
          options: { verbose: { type: 'boolean', default: false } },
        });
      }
      async run(options) {
        return scriptRunStub(options);
      }
    };

    sinon.spy(disconnect);
    sinon.stub(learningContentCache, 'quit');
  });

  it('does not run the script if not running from CLI', async function () {
    await ScriptRunner.execute(scriptFileUrl, ScriptClass, { logger, isRunningFromCli: () => false });
    expect(logger.info.called).to.be.false;
    expect(logger.error.called).to.be.false;
  });

  it('parses CLI options and run the script successfully', async function () {
    await ScriptRunner.execute(scriptFileUrl, ScriptClass, { logger, isRunningFromCli: () => true });

    expect(logger.info.calledWith('Start script')).to.be.true;
    expect(scriptRunStub).to.have.been.calledWith({ verbose: false });
    expect(logger.info.calledWith('Script execution successful.')).to.be.true;
  });

  it('handles errors during script execution and log failure', async function () {
    scriptRunStub.rejects('Error!!!');

    await ScriptRunner.execute(scriptFileUrl, ScriptClass, { logger, isRunningFromCli: () => true });

    expect(scriptRunStub.calledOnce).to.be.true;
    expect(logger.error.calledWith('Script execution failed.')).to.be.true;
    expect(logger.error.calledWithMatch(sinon.match.instanceOf(Error))).to.be.true;
    expect(process.exitCode).to.equal(1);
  });
});
