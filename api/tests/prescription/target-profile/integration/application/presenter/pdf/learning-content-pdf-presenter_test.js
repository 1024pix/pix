import { domainBuilder, expect, MockDate, sinon } from '../../../../../../test-helper.js';
import { isSameBinary } from '../../../../../../tooling/binary-comparator.js';
import * as learningContentPDFPresenter from '../../../../../../../src/prescription/target-profile/application/presenter/pdf/learning-content-pdf-presenter.js';
import { writeFile } from 'fs/promises';
import * as url from 'url';
import pdfLibUtils from 'pdf-lib/cjs/utils/index.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const REWRITE_REFERENCE_FILE = false;

describe('Integration | Application | Target-Profiles | Presenter | PDF | LearningContentPdfPresenter', function () {
  this.timeout(3000);

  beforeEach(function () {
    _makePdfLibPredictable();
    MockDate.set(new Date('2020-12-01'));
  });

  afterEach(function () {
    MockDate.reset();
  });

  it('should generate full learning content PDF in french (non-regression test)', async function () {
    // given
    const learningContent = _buildRichLearningContent();
    const referencePdfPath = 'learning-content-fr.pdf';

    // when
    const buffer = await learningContentPDFPresenter.present(
      learningContent,
      'Mon super Titre encore une fois beaucoup trop long pour tester un retour à la ligne aligné au centre',
      'fr',
    );

    await _writeFile(buffer, referencePdfPath);

    // then
    expect(
      await isSameBinary(`${__dirname}/${referencePdfPath}`, buffer),
      referencePdfPath + ' is not generated as expected',
    ).to.be.true;
  });

  it('should generate full learning content PDF in english (non-regression test)', async function () {
    // given
    const learningContent = _buildPoorLearningContent();
    const referencePdfPath = 'learning-content-en.pdf';

    // when
    const buffer = await learningContentPDFPresenter.present(
      learningContent,
      'My awesome super title yet again that is too long to test a carriage return align center',
      'en',
    );

    await _writeFile(buffer, referencePdfPath);

    // then
    expect(
      await isSameBinary(`${__dirname}/${referencePdfPath}`, buffer),
      referencePdfPath + ' is not generated as expected',
    ).to.be.true;
  });
});

async function _writeFile(buffer, outputFilename) {
  // Note: to update the reference pdf, set REWRITE_REFERENCE_FILE to true.
  if (REWRITE_REFERENCE_FILE) {
    await writeFile(`${__dirname}/${outputFilename}`, buffer);
  }
}

function _makePdfLibPredictable() {
  const suffixes = new Map();

  function autoIncrementSuffixByPrefix(prefix, suffixLength) {
    if (suffixLength === void 0) {
      suffixLength = 4;
    }

    const suffix = (suffixes.get(prefix) ?? Math.pow(10, suffixLength)) + 1;
    suffixes.set(prefix, suffix);

    return prefix + '-' + Math.floor(suffix);
  }

  sinon.stub(pdfLibUtils, 'addRandomSuffix').callsFake(autoIncrementSuffixByPrefix);
}

function _buildRichLearningContent() {
  const ref0 = domainBuilder.buildFramework({ id: 'recRef0', name: 'Réf 0 Jambon', areas: [] });
  const ref1 = domainBuilder.buildFramework({ id: 'recRef1', name: 'Réf 1 Fromage', areas: [] });
  _buildRichArea({
    color: 'jaffa',
    framework: ref0,
    areaIndex: '0',
    competenceCount: 5,
    thematicCountPerCompetence: [2, 1, 4, 3, 4],
    tubeCountPerCompetencePerThematic: [[2, 4], [1], [6, 3, 1, 4], [1, 2, 3], [2, 1, 3, 1]],
  });
  _buildRichArea({
    color: 'emerald',
    framework: ref0,
    areaIndex: '1',
    competenceCount: 2,
    thematicCountPerCompetence: [3, 2],
    tubeCountPerCompetencePerThematic: [
      [3, 2, 1],
      [4, 1],
    ],
  });
  _buildRichArea({
    color: 'cerulean',
    framework: ref1,
    areaIndex: '0',
    competenceCount: 1,
    thematicCountPerCompetence: [1],
    tubeCountPerCompetencePerThematic: [[1]],
  });
  _buildRichArea({
    color: 'wild-strawberry',
    framework: ref1,
    areaIndex: '1',
    competenceCount: 1,
    thematicCountPerCompetence: [2],
    tubeCountPerCompetencePerThematic: [[2, 1]],
  });
  _buildRichArea({
    color: 'butterfly-bush',
    framework: ref1,
    areaIndex: '2',
    competenceCount: 1,
    thematicCountPerCompetence: [1],
    tubeCountPerCompetencePerThematic: [[6]],
  });
  _buildRichArea({
    color: 'unknown-color',
    framework: ref0,
    areaIndex: '2',
    competenceCount: 1,
    thematicCountPerCompetence: [2],
    tubeCountPerCompetencePerThematic: [[1, 1]],
  });
  return domainBuilder.buildLearningContent([ref0, ref1]);
}

function _buildPoorLearningContent() {
  const ref0 = domainBuilder.buildFramework({ id: 'recRef0', name: 'Réf 0 Jambon', areas: [] });
  _buildRichArea({
    color: 'jaffa',
    framework: ref0,
    areaIndex: '0',
    competenceCount: 2,
    thematicCountPerCompetence: [2, 1],
    tubeCountPerCompetencePerThematic: [[2, 4], [1]],
  });
  return domainBuilder.buildLearningContent([ref0]);
}

function _buildRichArea({
  color,
  framework,
  areaIndex,
  competenceCount,
  thematicCountPerCompetence,
  tubeCountPerCompetencePerThematic,
}) {
  const superLongText =
    'Un super super super super super super super super super super long texte pour tester comment le {placeholder} va se positionner dans la page';
  const longText = 'Un long texte pour tester comment le {placeholder} va se positionner dans la page';
  const mediumText = 'Un texte de longueur moyenne pour tester {placeholder}';
  const shortText = 'Un texte court - {placeholder}';

  const area = domainBuilder.buildArea({
    id: `recArea_${framework.id.slice(-1)}_${areaIndex}`,
    title: longText.replace('{placeholder}', `Domaine_${framework.id.slice(-1)}_${areaIndex}`),
    color,
    frameworkId: framework.id,
  });
  area.competences = [];
  for (let competenceIndex = 0; competenceIndex < competenceCount; ++competenceIndex) {
    const competence = domainBuilder.buildCompetence({
      id: `recCompetence_${areaIndex}_${competenceIndex}`,
      name: shortText.replace('{placeholder}', `Competence_${areaIndex}_${competenceIndex}`),
      index: `${areaIndex}.${competenceIndex}`,
    });
    competence.thematics = [];
    const thematicCount = thematicCountPerCompetence[competenceIndex];
    for (let thematicIndex = 0; thematicIndex < thematicCount; ++thematicIndex) {
      const thematic = domainBuilder.buildThematic({
        id: `recThematic_0_${competenceIndex}_${thematicIndex}`,
        name: mediumText.replace('{placeholder}', `Thematic_${areaIndex}_${competenceIndex}_${thematicIndex}`),
        competenceId: `recCompetence_${areaIndex}_${competenceIndex}`,
      });
      thematic.tubes = [];
      const tubeCount = tubeCountPerCompetencePerThematic[competenceIndex][thematicIndex];
      for (let tubeIndex = 0; tubeIndex < tubeCount; ++tubeIndex) {
        const tube = domainBuilder.buildTube({
          id: `recTube_${areaIndex}_${competenceIndex}_${thematicIndex}_${tubeIndex}`,
          practicalTitle: mediumText.replace(
            '{placeholder}',
            `Tube_${areaIndex}_${competenceIndex}_${thematicIndex}_${tubeIndex}`,
          ),
          practicalDescription: superLongText.replace(
            '{placeholder}',
            `Tube_${areaIndex}_${competenceIndex}_${thematicIndex}_${tubeIndex}`,
          ),
        });
        thematic.tubes.push(tube);
      }
      competence.thematics.push(thematic);
    }
    area.competences.push(competence);
  }
  framework.areas.push(area);
}
