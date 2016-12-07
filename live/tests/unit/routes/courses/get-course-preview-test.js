import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | CoursePreview', function() {

  setupTest('route:courses/get-course-preview', {});

  it('exists', function() {
    const route = this.subject();
    expect(route).to.be.ok;
  });

});

