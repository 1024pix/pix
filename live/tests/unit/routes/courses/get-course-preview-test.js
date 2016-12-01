import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | CoursePreview', function() {

  setupTest('route:courses/get-course-preview', {});

  it('exists', function() {
    let route = this.subject();
    expect(route).to.be.ok;
  });

});

