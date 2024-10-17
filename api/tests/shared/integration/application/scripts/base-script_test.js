import { BaseScript } from '../../../../../src/shared/application/scripts/base-script.js';
import { catchErr, catchErrSync, expect, sinon } from '../../../../test-helper.js';

describe('Integration | API | Shared | BaseScript', function () {
  it('must be implemented with meta information', function () {
    // given
    class MyScript extends BaseScript {
      constructor() {
        super({ description: 'Hello', permanent: true });
      }
      async handle() {
        // do nothing
      }
    }

    // when
    const script = new MyScript();

    // then
    expect(script.metaInfo.description).to.equal('Hello');
    expect(script.metaInfo.permanent).to.be.true;
  });

  context('when meta information are invalid', function () {
    it('throws an error at the runtime', async function () {
      // given
      class MyScript extends BaseScript {
        constructor() {
          super({});
        }
        async handle() {
          // do nothing
        }
      }

      // when
      const error = catchErrSync(() => new MyScript())();

      // then
      expect(error).to.be.instanceof(Error);
      expect(error.message).to.equal('"description" is required. "permanent" is required');
    });
  });

  context('when handle method is not implemented', function () {
    it('throws an error at the runtime', async function () {
      // given
      class MyScript extends BaseScript {
        constructor() {
          super({ description: 'Hello', permanent: true });
        }
      }

      // then
      const logger = { info: sinon.spy(), error: sinon.spy() };

      // when
      const script = new MyScript();
      const error = await catchErr(() => script.run({}, logger))();

      // then
      expect(error).to.be.instanceof(Error);
      expect(error.message).to.equal('"handle" method must be implemented');
    });
  });

  context('when the script is successful', function () {
    it('runs without errors', async function () {
      // given
      class MyScript extends BaseScript {
        constructor() {
          super({ description: 'Hello', permanent: true });
        }
        async handle({ logger }) {
          logger.info('Handle it!');
        }
      }

      const logger = { info: sinon.spy(), error: sinon.spy() };

      // when
      const script = new MyScript();
      await script.run({}, logger);

      // then
      const loggerInfoArgs = logger.info.getCalls().map((call) => call.args[0]);
      expect(loggerInfoArgs).to.deep.equal(['Handle it!']);

      expect(logger.error.callCount).to.equal(0);
    });
  });

  context('when the script has errors', function () {
    it('throws errors', async function () {
      // given
      class MyScript extends BaseScript {
        constructor() {
          super({ description: 'Hello', permanent: true });
        }
        async handle() {
          throw new Error('This is an error');
        }
      }

      const logger = { info: sinon.spy(), error: sinon.spy() };

      // when
      const script = new MyScript();
      const error = await catchErr(() => script.run({}, logger))();

      // then
      expect(error).to.be.instanceof(Error);
      expect(error.message).to.equal('This is an error');
    });
  });

  context('when the hooks methods are implemented', function () {
    it('triggers onFinished hook', async function () {
      // given
      class MyScript extends BaseScript {
        constructor() {
          super({ description: 'Hello', permanent: true });
        }
        async handle() {
          // do nothing
        }
        async onFinished({ logger }) {
          logger.info('FINISHED!!!');
        }
      }

      const logger = { info: sinon.spy(), error: sinon.spy() };

      // when
      const script = new MyScript();
      await script.run({}, logger);

      // then
      const loggerInfoArgs = logger.info.getCalls().map((call) => call.args[0]);
      expect(loggerInfoArgs).to.contain('FINISHED!!!');
    });

    it('triggers onError hook', async function () {
      // given
      class MyScript extends BaseScript {
        constructor() {
          super({ description: 'Hello', permanent: true });
        }
        async handle() {
          throw new Error('Boom!!!');
        }
        async onError({ logger }) {
          logger.info('ERROR!!!');
        }
      }

      const logger = { info: sinon.spy(), error: sinon.spy() };

      // when
      const script = new MyScript();
      const error = await catchErr(() => script.run({}, logger))();

      // then
      expect(error).to.be.instanceof(Error);
      expect(error.message).to.equal('Boom!!!');

      const loggerInfoArgs = logger.info.getCalls().map((call) => call.args[0]);
      expect(loggerInfoArgs).to.contain('ERROR!!!');
    });
  });
});
