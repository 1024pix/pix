import { expect } from 'chai';
import sinon from 'sinon';

import { withDataExportGate } from '../../../../../src/shared/infrastructure/open-telemetry/gated-exporter.js';
import {
  isDataExportEnabled,
  setDataExportEnabled,
} from '../../../../../src/shared/infrastructure/open-telemetry/state.js';

const EXPORT_SUCCESS = { code: 0 };

// The OTLP exporters declare `export` on their prototype, which is what makes the gate's
// `super.export(...)` override work: the fake must do the same.
class FakeExporter {
  constructor(options) {
    this.options = options;
    this.exportedItems = [];
  }

  export(items, resultCallback) {
    this.exportedItems.push(items);
    resultCallback(EXPORT_SUCCESS);
  }

  selectAggregationTemporality(instrumentType) {
    return `temporality-for-${instrumentType}`;
  }
}

describe('Unit | Infrastructure | OpenTelemetry | withDataExportGate', function () {
  let wasDataExportEnabled;
  let GatedExporter;

  beforeEach(function () {
    wasDataExportEnabled = isDataExportEnabled();
    GatedExporter = withDataExportGate(FakeExporter);
  });

  afterEach(function () {
    setDataExportEnabled(wasDataExportEnabled);
  });

  context('when data export is enabled', function () {
    it('delegates the export to the exporter', function () {
      // given
      setDataExportEnabled(true);
      const exporter = new GatedExporter();
      const resultCallback = sinon.stub();

      // when
      exporter.export(['an item'], resultCallback);

      // then
      expect(exporter.exportedItems).to.deep.equal([['an item']]);
      expect(resultCallback).to.have.been.calledOnceWith(EXPORT_SUCCESS);
    });
  });

  context('when data export is disabled', function () {
    it('drops the items and reports a success', function () {
      // given
      setDataExportEnabled(false);
      const exporter = new GatedExporter();
      const resultCallback = sinon.stub();

      // when
      exporter.export(['an item'], resultCallback);

      // then
      expect(exporter.exportedItems).to.be.empty;
      expect(resultCallback).to.have.been.calledOnceWith(EXPORT_SUCCESS);
    });
  });

  it('follows the feature toggle changes without being rebuilt', function () {
    // given
    setDataExportEnabled(false);
    const exporter = new GatedExporter();
    exporter.export(['dropped'], sinon.stub());

    // when
    setDataExportEnabled(true);
    exporter.export(['sent'], sinon.stub());

    // then
    expect(exporter.exportedItems).to.deep.equal([['sent']]);
  });

  it('keeps the constructor options and the other exporter methods', function () {
    // given
    const exporter = new GatedExporter({ compression: 'gzip' });

    // when
    const temporality = exporter.selectAggregationTemporality('counter');

    // then
    expect(exporter.options).to.deep.equal({ compression: 'gzip' });
    expect(temporality).to.equal('temporality-for-counter');
  });
});
