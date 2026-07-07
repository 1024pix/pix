import { trace } from '@opentelemetry/api';
import sinon from 'sinon';

import { config } from '../../../../../src/shared/config.js';
import { otelProxy } from '../../../../../src/shared/infrastructure/open-telemetry/otel_proxy.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Infrastructure | Utils | otelProxy', function () {
  let spanStub;
  let tracerStub;
  let otelEnabled;

  beforeEach(function () {
    spanStub = {
      end: sinon.stub(),
      recordException: sinon.stub(),
      setStatus: sinon.stub(),
    };
    tracerStub = {
      startActiveSpan: sinon.stub().callsFake((name, cb) => cb(spanStub)),
    };
    sinon.stub(trace, 'getTracer').returns(tracerStub);
    otelEnabled = config.logging.otelEnabled;
    config.logging.otelEnabled = true;
  });

  afterEach(function () {
    config.logging.otelEnabled = otelEnabled;
  });

  describe('when resource is a function', function () {
    it('should wrap the function and create a span', function () {
      const fn = sinon.stub().returns(42);

      const wrapped = otelProxy(fn, 'myFunc');
      const result = wrapped('a', 'b');

      expect(result).to.equal(42);
      expect(fn).to.have.been.calledWith('a', 'b');
      expect(trace.getTracer).to.have.been.calledWith('otel-proxy');
      expect(tracerStub.startActiveSpan).to.have.been.calledWith('myFunc');
      expect(spanStub.end).to.have.been.calledOnce;
    });

    it('should end span after promise resolves', async function () {
      const fn = sinon.stub().resolves('async-result');

      const wrapped = otelProxy(fn, 'asyncFunc');
      const result = await wrapped();

      expect(result).to.equal('async-result');
      expect(spanStub.end).to.have.been.calledOnce;
    });

    it('should record exception and end span when promise rejects', async function () {
      const error = new Error('async-error');
      const fn = sinon.stub().rejects(error);

      const wrapped = otelProxy(fn, 'failingAsyncFunc');

      await expect(wrapped()).to.be.rejectedWith('async-error');
      expect(spanStub.recordException).to.have.been.calledWith(error);
      expect(spanStub.end).to.have.been.calledOnce;
    });

    it('should record exception and end span when function throws synchronously', function () {
      const error = new Error('sync-error');
      const fn = sinon.stub().throws(error);

      const wrapped = otelProxy(fn, 'throwingFunc');

      expect(() => wrapped()).to.throw('sync-error');
      expect(spanStub.recordException).to.have.been.calledWith(error);
      expect(spanStub.end).to.have.been.calledOnce;
    });

    it('should not wrap an already proxied function again', function () {
      const fn = sinon.stub().returns(1);

      const wrapped = otelProxy(fn, 'func');
      const wrappedAgain = otelProxy(wrapped, 'func');

      expect(wrappedAgain).to.equal(wrapped);
    });
  });

  describe('when resource is an object', function () {
    it('should wrap object methods and create spans', function () {
      const obj = { doSomething: sinon.stub().returns('done') };

      const proxied = otelProxy(obj, 'myObj');
      const result = proxied.doSomething('arg');

      expect(result).to.equal('done');
      expect(obj.doSomething).to.have.been.calledWith('arg');
      expect(tracerStub.startActiveSpan).to.have.been.calledWith('myObj->doSomething');
      expect(spanStub.end).to.have.been.calledOnce;
    });

    it('should return primitive properties as-is', function () {
      const obj = { count: 5, label: 'test' };

      const proxied = otelProxy(obj, 'myObj');

      expect(proxied.count).to.equal(5);
      expect(proxied.label).to.equal('test');
    });

    it('should recursively wrap nested objects', function () {
      const nested = { inner: sinon.stub().returns('nested-result') };
      const obj = { child: nested };

      const proxied = otelProxy(obj, 'myObj');
      const result = proxied.child.inner();

      expect(result).to.equal('nested-result');
      expect(tracerStub.startActiveSpan).to.have.been.calledWith('myObj->inner');
    });

    it('should not wrap an already proxied object again', function () {
      const obj = { foo: sinon.stub() };

      const proxied = otelProxy(obj, 'myObj');
      const proxiedAgain = otelProxy(proxied, 'myObj');

      expect(proxiedAgain).to.equal(proxied);
    });

    it('should return null properties as-is', function () {
      const obj = { empty: null };

      const proxied = otelProxy(obj, 'myObj');

      expect(proxied.empty).to.be.null;
    });
  });
});
