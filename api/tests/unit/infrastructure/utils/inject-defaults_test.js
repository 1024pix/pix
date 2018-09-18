const { expect } = require('../../../test-helper');
const injectDefaults = require('../../../../lib/infrastructure/utils/inject-defaults');

describe('Unit | Utils | #injectDefaults', function() {

  it('should wrap target function with default values provided', () => {
    // given
    const targetFn = function({ defaulted, notDefaulted }) {
      return [ defaulted, notDefaulted ];
    };

    const defaults = {
      defaulted: 'defaultValue',
      unused: 'unusedValue'
    };

    // when
    const wrappedFn = injectDefaults(defaults, targetFn);

    // then
    expect(wrappedFn({ notDefaulted: 'newValue' }))
      .to.deep.equal(['defaultValue', 'newValue']);
    expect(wrappedFn({ defaulted: 'overridden', notDefaulted: 'newValue' }))
      .to.deep.equal(['overridden', 'newValue']);
  });

});
