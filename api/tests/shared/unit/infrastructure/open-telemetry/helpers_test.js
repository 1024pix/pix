import { trace } from '@opentelemetry/api';
import { expect } from 'chai';
import sinon from 'sinon';

import { tracing } from '../../../../../src/shared/infrastructure/open-telemetry/helpers.js';

describe('Shared | Unit | Infrastructure | OpenTelemetry | helpers', function () {
  describe('tracing#addAttributes', function () {
    let span;

    beforeEach(function () {
      span = { setAttributes: sinon.stub() };
      sinon.stub(trace, 'getActiveSpan').returns(span);
    });

    it('prefixes attributes with "pix" by default', function () {
      // when
      tracing.addAttributes({ foo: 'bar' });

      // then
      expect(span.setAttributes).to.have.been.calledOnceWithExactly({ 'pix.foo': 'bar' });
    });

    it('prefixes attributes with the given prefix', function () {
      // when
      tracing.addAttributes({ foo: 'bar', count: 2 }, 'custom');

      // then
      expect(span.setAttributes).to.have.been.calledOnceWithExactly({ 'custom.foo': 'bar', 'custom.count': 2 });
    });

    it('does not prefix attributes when prefix is falsy', function () {
      // when
      tracing.addAttributes({ foo: 'bar' }, '');

      // then
      expect(span.setAttributes).to.have.been.calledOnceWithExactly({ foo: 'bar' });
    });

    it('does nothing when there is no active span', function () {
      // given
      trace.getActiveSpan.returns(undefined);

      // when / then
      expect(() => tracing.addAttributes({ foo: 'bar' })).not.to.throw();
    });
  });
});
