import nock from 'nock';

import { ModuleFactory } from '../../../../src/devcomp/infrastructure/factories/module-factory.js';
import { getSectionsListAsCsv } from '../../../../src/devcomp/scripts/get-sections-csv.js';
import { expect } from '../../../test-helper.js';
import moduleContent from './test-module.json' with { type: 'json' };

describe('Acceptance | Script | Get Sections as CSV', function () {
  it(`should return sections list as CSV`, async function () {
    // Given
    nock('https://assets.pix.org').persist().head(/^.+$/).reply(200, {});
    const modulesListAsJs = [await ModuleFactory.build(moduleContent)];

    // When
    const sectionsListAsCsv = await getSectionsListAsCsv(modulesListAsJs);

    // Then
    expect(sectionsListAsCsv).to.be.a('string');
    expect(sectionsListAsCsv).to.equal(`\ufeff"SectionModule"\t"SectionId"\t"SectionType"\t"SectionPosition"
"6282925d-4775-4bca-b513-4c3009ec5886"\t"5bf1c672-3746-4480-b9ac-1f0af9c7c509"\t"practise"\t1`);
  });
});
