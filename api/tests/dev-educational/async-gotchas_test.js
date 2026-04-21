describe('Async gotchas – anti-patterns vs good patterns', function () {
  function getStack(fn) {
    return fn().catch((err) => err.stack);
  }

  context('error re-throw', function () {
    context('❌ Anti-pattern: throw a new error and ignore the first error', function () {
      it('resets the stack trace', async function () {
        async function levelOne() {
          throw new Error('boom');
        }

        async function levelTwo() {
          try {
            await levelOne();
          } catch (err) {
            throw new Error(err.message);
          }
        }

        const stack = await getStack(() => levelTwo());
        expect(stack).to.include('levelTwo').and.to.not.include('levelOne');
      });
    });

    context('✅ Good pattern: let the first error bubble up', function () {
      it('keeps the full stack trace', async function () {
        async function levelOne() {
          throw new Error('boom');
        }

        async function levelTwo() {
          await levelOne();
        }

        const stack = await getStack(() => levelTwo());
        expect(stack).to.include('levelTwo').and.to.include('levelOne');
      });
    });

    context('✅ Good pattern: rethrow the same error', function () {
      it('keeps the full stack trace', async function () {
        async function levelOne() {
          throw new Error('boom');
        }

        async function levelTwo() {
          try {
            await levelOne();
          } catch (err) {
            void 0; // let's pretend this piece of code does something super useful
            throw err;
          }
        }

        const stack = await getStack(() => levelTwo());
        expect(stack).to.include('levelTwo').and.to.include('levelOne');
      });
    });
  });

  context('return vs return await in a function', function () {
    context('❌ Anti-pattern: return a promise without awaiting it', function () {
      it('loses the current function from the stack trace', async function () {
        async function levelOne() {
          await new Promise((resolve) => setTimeout(resolve, 10));
          throw new Error('boom');
        }

        function levelTwo() {
          return levelOne();
        }

        async function levelThree() {
          try {
            return await levelTwo();
          } catch (err) {
            void 0; // let's pretend this piece of code does something super useful
            throw err;
          }
        }

        const stack = await getStack(() => levelThree());
        expect(stack).to.include('levelOne').and.to.include('levelThree').and.to.not.include('levelTwo');
      });
    });
    context('✅ Good pattern: return a promise by awaiting it first', function () {
      it('keeps the full stack trace', async function () {
        async function levelOne() {
          await new Promise((resolve) => setTimeout(resolve, 10));
          throw new Error('boom');
        }

        async function levelTwo() {
          return await levelOne();
        }

        async function levelThree() {
          try {
            return await levelTwo();
          } catch (err) {
            void 0; // let's pretend this piece of code does something super useful
            throw err;
          }
        }

        const stack = await getStack(() => levelThree());
        expect(stack).to.include('levelOne').and.to.include('levelTwo').and.to.include('levelThree');
      });
    });
  });

  context('return vs return await in a try/catch block', function () {
    context('❌ Anti-pattern: return a promise without awaiting it', function () {
      it('loses the current function from the stack trace and never runs the catch block', async function () {
        async function levelOne() {
          await new Promise((resolve) => setTimeout(resolve, 10));
          throw new Error('boom');
        }

        let catchBlockExecuted = false;
        async function levelTwo() {
          try {
            return levelOne();
          } catch (err) {
            catchBlockExecuted = true;
            throw err;
          }
        }

        const stack = await getStack(() => levelTwo());
        expect(stack).to.include('levelOne').and.to.not.include('levelTwo');
        expect(catchBlockExecuted).to.be.false;
      });
    });
    context('✅ Good pattern: return a promise by awaiting it first', function () {
      it('keeps the full stack trace and run through the catch block', async function () {
        async function levelOne() {
          await new Promise((resolve) => setTimeout(resolve, 10));
          throw new Error('boom');
        }

        let catchBlockExecuted = false;
        async function levelTwo() {
          try {
            return await levelOne();
          } catch (err) {
            catchBlockExecuted = true;
            throw err;
          }
        }

        const stack = await getStack(() => levelTwo());
        expect(stack).to.include('levelOne').and.to.include('levelTwo');
        expect(catchBlockExecuted).to.be.true;
      });
    });
  });
});
