export const data = {};

export function fixture({ databaseBuilder }) {
  const learningContent = {
    frameworks: [
      {
        id: 'frameworkPix',
        name: 'Pix',
      },
    ],
    areas: [
      {
        id: 'areaPixA1',
        name: 'areaPixA1 name',
        title_i18n: {
          fr: 'areaPixA1 title fr',
        },
        color: 'areaPixA1 color',
        code: '1',
        frameworkId: 'frameworkPix',
        competenceIds: [
          'competencePixA1C1',
          'competencePixA1C2',
          'competencePixA1C3',
          'competencePixA1C4',
          'competencePixA1C5',
        ],
      },
    ],
    competences: [
      {
        id: 'competencePixA1C1',
        name_i18n: {
          fr: 'competencePixA1C1 name fr',
        },
        description_i18n: {
          fr: 'competencePixA1C1 description fr',
        },
        index: '1.1',
        origin: 'Pix',
        areaId: 'areaPixA1',
        skillIds: [],
        thematicIds: ['thematicPixA1C1Th1'],
      },
      {
        id: 'competencePixA1C2',
        name_i18n: {
          fr: 'competencePixA1C2 name fr',
        },
        description_i18n: {
          fr: 'competencePixA1C2 description fr',
        },
        index: '1.2',
        origin: 'Pix',
        areaId: 'areaPixA1',
        skillIds: [],
        thematicIds: ['thematicPixA1C2Th1'],
      },
      {
        id: 'competencePixA1C3',
        name_i18n: {
          fr: 'competencePixA1C3 name fr',
        },
        description_i18n: {
          fr: 'competencePixA1C3 description fr',
        },
        index: '1.3',
        origin: 'Pix',
        areaId: 'areaPixA1',
        skillIds: [],
        thematicIds: ['thematicPixA1C3Th1'],
      },
      {
        id: 'competencePixA1C4',
        name_i18n: {
          fr: 'competencePixA1C4 name fr',
        },
        description_i18n: {
          fr: 'competencePixA1C4 description fr',
        },
        index: '1.4',
        origin: 'Pix',
        areaId: 'areaPixA1',
        skillIds: [],
        thematicIds: ['thematicPixA1C4Th1'],
      },
      {
        id: 'competencePixA1C5',
        name_i18n: {
          fr: 'competencePixA1C5 name fr',
        },
        description_i18n: {
          fr: 'competencePixA1C5 description fr',
        },
        index: '1.5',
        origin: 'Pix',
        areaId: 'areaPixA1',
        skillIds: [],
        thematicIds: ['thematicPixA1C5Th1'],
      },
    ],
    thematics: [
      {
        id: 'thematicPixA1C1Th1',
        name_i18n: {
          fr: 'thematicPixA1C1Th1 name fr',
        },
        index: 1,
        competenceId: 'competencePixA1C1',
        tubeIds: ['tubePixA1C1Th1Tu1'],
      },
      {
        id: 'thematicPixA1C2Th1',
        name_i18n: {
          fr: 'thematicPixA1C2Th1 name fr',
        },
        index: 1,
        competenceId: 'competencePixA1C2',
        tubeIds: ['tubePixA1C2Th1Tu1'],
      },
      {
        id: 'thematicPixA1C3Th1',
        name_i18n: {
          fr: 'thematicPixA1C3Th1 name fr',
        },
        index: 1,
        competenceId: 'competencePixA1C3',
        tubeIds: ['tubePixA1C3Th1Tu1'],
      },
      {
        id: 'thematicPixA1C4Th1',
        name_i18n: {
          fr: 'thematicPixA1C4Th1 name fr',
        },
        index: 1,
        competenceId: 'competencePixA1C4',
        tubeIds: ['tubePixA1C4Th1Tu1'],
      },
      {
        id: 'thematicPixA1C5Th1',
        name_i18n: {
          fr: 'thematicPixA1C5Th1 name fr',
        },
        index: 1,
        competenceId: 'competencePixA1C5',
        tubeIds: ['tubePixA1C5Th1Tu1'],
      },
    ],
    tubes: [
      {
        id: 'tubePixA1C1Th1Tu1',
        name: '@tubePixA1C1Th1TubeUn',
        title: 'tubePixA1C1Th1Tu1 title',
        description: 'tubePixA1C1Th1Tu1 description',
        practicalTitle_i18n: {
          fr: 'tubePixA1C1Th1Tu1 practicalTitle fr',
        },
        practicalDescription_i18n: {
          fr: 'tubePixA1C1Th1Tu1 practicalDescription fr',
        },
        isTabletCompliant: true,
        isMobileCompliant: false,
        competenceId: 'competencePixA1C1',
        thematicId: 'thematicPixA1C1Th1',
        skillIds: [],
      },
      {
        id: 'tubePixA1C2Th1Tu1',
        name: '@tubePixA1C2Th1TubeUn',
        title: 'tubePixA1C2Th1Tu1 title',
        description: 'tubePixA1C2Th1Tu1 description',
        practicalTitle_i18n: {
          fr: 'tubePixA1C2Th1Tu1 practicalTitle fr',
        },
        practicalDescription_i18n: {
          fr: 'tubePixA1C2Th1Tu1 practicalDescription fr',
        },
        isTabletCompliant: false,
        isMobileCompliant: true,
        competenceId: 'competencePixA1C2',
        thematicId: 'thematicPixA1C2Th1',
        skillIds: [],
      },
      {
        id: 'tubePixA1C3Th1Tu1',
        name: '@tubePixA1C3Th1TubeUn',
        title: 'tubePixA1C3Th1Tu1 title',
        description: 'tubePixA1C3Th1Tu1 description',
        practicalTitle_i18n: {
          fr: 'tubePixA1C3Th1Tu1 practicalTitle fr',
        },
        practicalDescription_i18n: {
          fr: 'tubePixA1C3Th1Tu1 practicalDescription fr',
        },
        isTabletCompliant: true,
        isMobileCompliant: true,
        competenceId: 'competencePixA1C3',
        thematicId: 'thematicPixA1C3Th1',
        skillIds: [],
      },
      {
        id: 'tubePixA1C4Th1Tu1',
        name: '@tubePixA1C4Th1TubeUn',
        title: 'tubePixA1C4Th1Tu1 title',
        description: 'tubePixA1C4Th1Tu1 description',
        practicalTitle_i18n: {
          fr: 'tubePixA1C4Th1Tu1 practicalTitle fr',
        },
        practicalDescription_i18n: {
          fr: 'tubePixA1C4Th1Tu1 practicalDescription fr',
        },
        isTabletCompliant: false,
        isMobileCompliant: false,
        competenceId: 'competencePixA1C4',
        thematicId: 'thematicPixA1C4Th1',
        skillIds: [],
      },
      {
        id: 'tubePixA1C5Th1Tu1',
        name: '@tubePixA1C5Th1TubeUn',
        title: 'tubePixA1C5Th1Tu1 title',
        description: 'tubePixA1C5Th1Tu1 description',
        practicalTitle_i18n: {
          fr: 'tubePixA1C5Th1Tu1 practicalTitle fr',
        },
        practicalDescription_i18n: {
          fr: 'tubePixA1C5Th1Tu1 practicalDescription fr',
        },
        isTabletCompliant: true,
        isMobileCompliant: true,
        competenceId: 'competencePixA1C5',
        thematicId: 'thematicPixA1C5Th1',
        skillIds: [],
      },
    ],
    skills: [],
  };

  for (const tube of learningContent.tubes) {
    for (let level = 1; level < 8; ++level) {
      const mainPartId = tube.id.split('tube')[1];
      const skillId = `skill${mainPartId}S${level}`;
      learningContent.skills.push({
        id: skillId,
        name: `${tube.name}${level}`,
        status: 'actif',
        pixValue: 2,
        level,
        competenceId: tube.competenceId,
        tubeId: tube.id,
      });
      tube.skillIds.push(skillId);
      const competence = learningContent.competences.find((competence) => competence.id === tube.competenceId);
      competence.skillIds.push(skillId);
    }
  }

  data.learningContent = learningContent;

  databaseBuilder.factory.learningContent.build(learningContent);
}
