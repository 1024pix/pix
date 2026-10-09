export const CORE_LEVELS = {
  0: 'LEVEL_PRE_BEGINNER',
  1: 'LEVEL_BEGINNER_1',
  2: 'LEVEL_BEGINNER_2',
  3: 'LEVEL_INDEPENDENT_3',
  4: 'LEVEL_INDEPENDENT_4',
  5: 'LEVEL_ADVANCED_5',
  6: 'LEVEL_ADVANCED_6',
  7: 'LEVEL_EXPERT_7',
  8: 'LEVEL_EXPERT_8',
};

export const EDU_LEVELS = {
  0: 'LEVEL_ADMISSIBLE',
};

export const STANDARD_PIX_PLUS_LEVELS = {
  0: 'LEVEL_INDEPENDENT',
  1: 'LEVEL_CONFIRMED',
  2: 'LEVEL_ADVANCED',
  3: 'LEVEL_EXPERT',
};

export const CORE_MESH_CONFIGURATION = new Map([
  [CORE_LEVELS[0], { weight: 64, coefficient: 0 }],
  [CORE_LEVELS[1], { weight: 64, coefficient: 1 }],
  [CORE_LEVELS[2], { weight: 128, coefficient: 1 }],
  [CORE_LEVELS[3], { weight: 128, coefficient: 2 }],
  [CORE_LEVELS[4], { weight: 128, coefficient: 3 }],
  [CORE_LEVELS[5], { weight: 128, coefficient: 4 }],
  [CORE_LEVELS[6], { weight: 128, coefficient: 5 }],
  [CORE_LEVELS[7], { weight: 128, coefficient: 6 }],
  [CORE_LEVELS[8], { weight: 128, coefficient: 7 }],
]);

export const PIX_PLUS_EDU_EXTERNAL_LEVELS = {
  ADVANCED: 'ADVANCED',
  EXPERT: 'EXPERT',
};
