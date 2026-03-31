import nock from 'nock';

import { ValidatorQCM } from '../../../../../src/evaluation/domain/models/ValidatorQCM.js';
import { ValidatorQCU } from '../../../../../src/evaluation/domain/models/ValidatorQCU.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { ENGLISH_SPOKEN, FRENCH_SPOKEN } from '../../../../../src/shared/domain/services/locale-service.js';
import * as challengeRepository from '../../../../../src/shared/infrastructure/repositories/challenge-repository.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Repository | challenge-repository', function () {
  const challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson = {
    id: 'challengeId00',
    instruction: 'instruction challengeId00',
    alternativeInstruction: 'alternativeInstruction challengeId00',
    proposals: 'proposals challengeId00',
    type: 'QCU',
    solution: 'solution challengeId00',
    solutionToDisplay: 'solutionToDisplay challengeId00',
    t1Status: true,
    t2Status: false,
    t3Status: true,
    status: 'validé',
    genealogy: 'genealogy challengeId00',
    accessibility1: 'accessibility1 challengeId00',
    accessibility2: 'accessibility2 challengeId00',
    requireGafamWebsiteAccess: true,
    isIncompatibleIpadCertif: false,
    deafAndHardOfHearing: 'deafAndHardOfHearing challengeId00',
    isAwarenessChallenge: true,
    toRephrase: false,
    alternativeVersion: 10,
    shuffled: true,
    illustrationAlt: 'illustrationAlt challengeId00',
    illustrationUrl: 'illustrationUrl challengeId00',
    attachments: ['attachment1', 'attachment2'],
    responsive: 'responsive challengeId00',
    alpha: 1.1,
    delta: 3.3,
    autoReply: true,
    focusable: true,
    format: 'format challengeId00',
    timer: 180,
    embedHeight: 800,
    embedUrl: 'embedUrl challengeId00',
    embedTitle: 'embedTitle challengeId00',
    locales: ['fr', 'nl'],
    competenceId: 'competenceId00',
    skillId: 'skillId00',
    hasEmbedInternalValidation: true,
    noValidationNeeded: true,
  };
  const challengeData01_skill00_qcu_valide_flashCompatible_fren_withEmbedJson = {
    id: 'challengeId01',
    instruction: 'instruction challengeId01',
    alternativeInstruction: 'alternativeInstruction challengeId01',
    proposals: 'proposals challengeId01',
    type: 'QCU',
    solution: 'solution challengeId01',
    solutionToDisplay: 'solutionToDisplay challengeId01',
    t1Status: false,
    t2Status: true,
    t3Status: true,
    status: 'validé',
    genealogy: 'genealogy challengeId01',
    accessibility1: 'accessibility1 challengeId01',
    accessibility2: 'accessibility2 challengeId01',
    requireGafamWebsiteAccess: false,
    isIncompatibleIpadCertif: true,
    deafAndHardOfHearing: 'deafAndHardOfHearing challengeId01',
    isAwarenessChallenge: true,
    toRephrase: false,
    alternativeVersion: 20,
    shuffled: false,
    illustrationAlt: 'illustrationAlt challengeId01',
    illustrationUrl: 'illustrationUrl challengeId01',
    attachments: ['attachment1', 'attachment2'],
    responsive: 'responsive challengeId01',
    alpha: 1.2,
    delta: 3.4,
    autoReply: true,
    focusable: false,
    format: 'format challengeId01',
    timer: 180,
    embedHeight: 801,
    embedUrl: 'https://example.com/embed.json',
    embedTitle: 'embedTitle challengeId01',
    locales: ['fr', 'en'],
    competenceId: 'competenceId00',
    skillId: 'skillId00',
    hasEmbedInternalValidation: true,
    noValidationNeeded: true,
  };
  const challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson = {
    id: 'challengeId02',
    instruction: 'instruction challengeId02',
    alternativeInstruction: 'alternativeInstruction challengeId02',
    proposals: 'proposals challengeId02',
    type: 'QCM',
    solution: 'solution challengeId02',
    solutionToDisplay: 'solutionToDisplay challengeId02',
    t1Status: false,
    t2Status: true,
    t3Status: false,
    status: 'archivé',
    genealogy: 'genealogy challengeId02',
    accessibility1: 'accessibility1 challengeId02',
    accessibility2: 'accessibility2 challengeId02',
    requireGafamWebsiteAccess: false,
    isIncompatibleIpadCertif: false,
    deafAndHardOfHearing: 'deafAndHardOfHearing challengeId02',
    isAwarenessChallenge: true,
    toRephrase: false,
    alternativeVersion: 30,
    shuffled: false,
    illustrationAlt: 'illustrationAlt challengeId02',
    illustrationUrl: 'illustrationUrl challengeId02',
    attachments: ['attachment1', 'attachment2'],
    responsive: 'responsive challengeId02',
    alpha: 1.3,
    delta: 3.5,
    autoReply: false,
    focusable: false,
    format: 'format challengeId02',
    timer: null,
    embedHeight: 802,
    embedUrl: 'embed url challengeId02',
    embedTitle: 'embedTitle challengeId02',
    locales: ['en'],
    competenceId: 'competenceId00',
    skillId: 'skillId00',
  };
  const challengeData03_skill00_qcm_valide_flashCompatible_nl_noEmbedJson = {
    id: 'challengeId03',
    instruction: 'instruction challengeId03',
    alternativeInstruction: 'alternativeInstruction challengeId03',
    proposals: 'proposals challengeId03',
    type: 'QCM',
    solution: 'solution challengeId03',
    solutionToDisplay: 'solutionToDisplay challengeId03',
    t1Status: true,
    t2Status: true,
    t3Status: false,
    status: 'validé',
    genealogy: 'genealogy challengeId03',
    accessibility1: 'accessibility1 challengeId03',
    accessibility2: 'accessibility2 challengeId03',
    requireGafamWebsiteAccess: true,
    isIncompatibleIpadCertif: false,
    deafAndHardOfHearing: 'deafAndHardOfHearing challengeId03',
    isAwarenessChallenge: true,
    toRephrase: false,
    alternativeVersion: 40,
    shuffled: true,
    illustrationAlt: 'illustrationAlt challengeId03',
    illustrationUrl: 'illustrationUrl challengeId03',
    attachments: ['attachment1', 'attachment2'],
    responsive: 'responsive challengeId03',
    alpha: 1.4,
    delta: 3.6,
    autoReply: true,
    focusable: false,
    format: 'format challengeId03',
    timer: null,
    embedHeight: 803,
    embedUrl: 'embed url challengeId03',
    embedTitle: 'embedTitle challengeId03',
    locales: ['nl'],
    competenceId: 'competenceId00',
    skillId: 'skillId00',
  };
  const enUGValidatedChallenge = {
    id: 'enUGValidatedChallengeId',
    instruction: 'instruction enUGValidatedChallengeId',
    alternativeInstruction: 'alternativeInstruction enUGValidatedChallengeId',
    proposals: 'proposals enUGValidatedChallengeId',
    type: 'QCU',
    solution: 'solution enUGValidatedChallengeId',
    solutionToDisplay: 'solutionToDisplay enUGValidatedChallengeId',
    t1Status: true,
    t2Status: true,
    t3Status: false,
    status: 'validé',
    genealogy: 'genealogy enUGValidatedChallengeId',
    accessibility1: 'accessibility1 enUGValidatedChallengeId',
    accessibility2: 'accessibility2 enUGValidatedChallengeId',
    requireGafamWebsiteAccess: true,
    isIncompatibleIpadCertif: false,
    deafAndHardOfHearing: 'deafAndHardOfHearing enUGValidatedChallengeId',
    isAwarenessChallenge: true,
    toRephrase: false,
    alternativeVersion: 40,
    shuffled: true,
    illustrationAlt: 'illustrationAlt enUGValidatedChallengeId',
    illustrationUrl: 'illustrationUrl enUGValidatedChallengeId',
    attachments: ['attachment1', 'attachment2'],
    responsive: 'responsive enUGValidatedChallengeId',
    alpha: 1.4,
    delta: 3.6,
    autoReply: true,
    focusable: false,
    format: 'format enUGValidatedChallengeId',
    timer: null,
    embedHeight: 803,
    embedUrl: 'embed url enUGValidatedChallengeId',
    embedTitle: 'embedTitle enUGValidatedChallengeId',
    locales: ['en', 'en-UG'],
    competenceId: 'someCompetenceId',
    skillId: 'activeSkillId',
  };

  const enUGArchivedChallenge = {
    id: 'enUGArchivedChallengeId',
    instruction: 'instruction enUGArchivedChallengeId',
    alternativeInstruction: 'alternativeInstruction enUGArchivedChallengeId',
    proposals: 'proposals enUGArchivedChallengeId',
    type: 'QCU',
    solution: 'solution enUGArchivedChallengeId',
    solutionToDisplay: 'solutionToDisplay enUGArchivedChallengeId',
    t1Status: true,
    t2Status: true,
    t3Status: false,
    status: 'archivé',
    genealogy: 'genealogy enUGArchivedChallengeId',
    accessibility1: 'accessibility1 enUGArchivedChallengeId',
    accessibility2: 'accessibility2 enUGArchivedChallengeId',
    requireGafamWebsiteAccess: true,
    isIncompatibleIpadCertif: false,
    deafAndHardOfHearing: 'deafAndHardOfHearing enUGArchivedChallengeId',
    isAwarenessChallenge: true,
    toRephrase: false,
    alternativeVersion: 40,
    shuffled: true,
    illustrationAlt: 'illustrationAlt enUGArchivedChallengeId',
    illustrationUrl: 'illustrationUrl enUGArchivedChallengeId',
    attachments: ['attachment1', 'attachment2'],
    responsive: 'responsive enUGArchivedChallengeId',
    alpha: 1.4,
    delta: 3.6,
    autoReply: true,
    focusable: false,
    format: 'format enUGArchivedChallengeId',
    timer: null,
    embedHeight: 803,
    embedUrl: 'embed url enUGArchivedChallengeId',
    embedTitle: 'embedTitle enUGArchivedChallengeId',
    locales: ['en-UG'],
    competenceId: 'someCompetenceId',
    skillId: 'activeSkillId',
  };

  const enTZValidatedChallenge = {
    id: 'enTZValidatedChallengeId',
    instruction: 'instruction enTZValidatedChallengeId',
    alternativeInstruction: 'alternativeInstruction enTZValidatedChallengeId',
    proposals: 'proposals enTZValidatedChallengeId',
    type: 'QCU',
    solution: 'solution enTZValidatedChallengeId',
    solutionToDisplay: 'solutionToDisplay enTZValidatedChallengeId',
    t1Status: true,
    t2Status: true,
    t3Status: false,
    status: 'validé',
    genealogy: 'genealogy enTZValidatedChallengeId',
    accessibility1: 'accessibility1 enTZValidatedChallengeId',
    accessibility2: 'accessibility2 enTZValidatedChallengeId',
    requireGafamWebsiteAccess: true,
    isIncompatibleIpadCertif: false,
    deafAndHardOfHearing: 'deafAndHardOfHearing enTZValidatedChallengeId',
    isAwarenessChallenge: true,
    toRephrase: false,
    alternativeVersion: 40,
    shuffled: true,
    illustrationAlt: 'illustrationAlt enTZValidatedChallengeId',
    illustrationUrl: 'illustrationUrl enTZValidatedChallengeId',
    attachments: ['attachment1', 'attachment2'],
    responsive: 'responsive enTZValidatedChallengeId',
    alpha: 1.4,
    delta: 3.6,
    autoReply: true,
    focusable: false,
    format: 'format enTZValidatedChallengeId',
    timer: null,
    embedHeight: 803,
    embedUrl: 'embed url enTZValidatedChallengeId',
    embedTitle: 'embedTitle enTZValidatedChallengeId',
    locales: ['en-TZ'],
    competenceId: 'someCompetenceId',
    skillId: 'activeSkillId',
  };
  const enTZArchivedChallenge = {
    id: 'enTZArchivedChallengeId',
    instruction: 'instruction enTZArchivedChallengeId',
    alternativeInstruction: 'alternativeInstruction enTZArchivedChallengeId',
    proposals: 'proposals enTZArchivedChallengeId',
    type: 'QCU',
    solution: 'solution enTZArchivedChallengeId',
    solutionToDisplay: 'solutionToDisplay enTZArchivedChallengeId',
    t1Status: true,
    t2Status: true,
    t3Status: false,
    status: 'archivé',
    genealogy: 'genealogy enTZArchivedChallengeId',
    accessibility1: 'accessibility1 enTZArchivedChallengeId',
    accessibility2: 'accessibility2 enTZArchivedChallengeId',
    requireGafamWebsiteAccess: true,
    isIncompatibleIpadCertif: false,
    deafAndHardOfHearing: 'deafAndHardOfHearing enTZArchivedChallengeId',
    isAwarenessChallenge: true,
    toRephrase: false,
    alternativeVersion: 40,
    shuffled: true,
    illustrationAlt: 'illustrationAlt enTZArchivedChallengeId',
    illustrationUrl: 'illustrationUrl enTZArchivedChallengeId',
    attachments: ['attachment1', 'attachment2'],
    responsive: 'responsive enTZArchivedChallengeId',
    alpha: 1.4,
    delta: 3.6,
    autoReply: true,
    focusable: false,
    format: 'format enTZArchivedChallengeId',
    timer: null,
    embedHeight: 803,
    embedUrl: 'embed url enTZArchivedChallengeId',
    embedTitle: 'embedTitle enTZArchivedChallengeId',
    locales: ['en-TZ'],
    competenceId: 'someCompetenceId',
    skillId: 'activeSkillId',
  };
  const enValidatedChallenge = {
    id: 'enValidatedChallengeId',
    instruction: 'instruction enValidatedChallengeId',
    alternativeInstruction: 'alternativeInstruction enValidatedChallengeId',
    proposals: 'proposals enValidatedChallengeId',
    type: 'QCU',
    solution: 'solution enValidatedChallengeId',
    solutionToDisplay: 'solutionToDisplay enValidatedChallengeId',
    t1Status: true,
    t2Status: true,
    t3Status: false,
    status: 'validé',
    genealogy: 'genealogy enValidatedChallengeId',
    accessibility1: 'accessibility1 enValidatedChallengeId',
    accessibility2: 'accessibility2 enValidatedChallengeId',
    requireGafamWebsiteAccess: true,
    isIncompatibleIpadCertif: false,
    deafAndHardOfHearing: 'deafAndHardOfHearing enValidatedChallengeId',
    isAwarenessChallenge: true,
    toRephrase: false,
    alternativeVersion: 40,
    shuffled: true,
    illustrationAlt: 'illustrationAlt enValidatedChallengeId',
    illustrationUrl: 'illustrationUrl enValidatedChallengeId',
    attachments: ['attachment1', 'attachment2'],
    responsive: 'responsive enValidatedChallengeId',
    alpha: 1.4,
    delta: 3.6,
    autoReply: true,
    focusable: false,
    format: 'format enValidatedChallengeId',
    timer: null,
    embedHeight: 803,
    embedUrl: 'embed url enValidatedChallengeId',
    embedTitle: 'embedTitle enValidatedChallengeId',
    locales: ['en'],
    competenceId: 'someCompetenceId',
    skillId: 'activeSkillId',
  };
  const enArchivedChallenge = {
    id: 'enArchivedChallengeId',
    instruction: 'instruction enArchivedChallengeId',
    alternativeInstruction: 'alternativeInstruction enArchivedChallengeId',
    proposals: 'proposals enArchivedChallengeId',
    type: 'QCU',
    solution: 'solution enArchivedChallengeId',
    solutionToDisplay: 'solutionToDisplay enArchivedChallengeId',
    t1Status: true,
    t2Status: true,
    t3Status: false,
    status: 'archivé',
    genealogy: 'genealogy enArchivedChallengeId',
    accessibility1: 'accessibility1 enArchivedChallengeId',
    accessibility2: 'accessibility2 enArchivedChallengeId',
    requireGafamWebsiteAccess: true,
    isIncompatibleIpadCertif: false,
    deafAndHardOfHearing: 'deafAndHardOfHearing enArchivedChallengeId',
    isAwarenessChallenge: true,
    toRephrase: false,
    alternativeVersion: 40,
    shuffled: true,
    illustrationAlt: 'illustrationAlt enArchivedChallengeId',
    illustrationUrl: 'illustrationUrl enArchivedChallengeId',
    attachments: ['attachment1', 'attachment2'],
    responsive: 'responsive enArchivedChallengeId',
    alpha: 1.4,
    delta: 3.6,
    autoReply: true,
    focusable: false,
    format: 'format enArchivedChallengeId',
    timer: null,
    embedHeight: 803,
    embedUrl: 'embed url enArchivedChallengeId',
    embedTitle: 'embedTitle enArchivedChallengeId',
    locales: ['en'],
    competenceId: 'someCompetenceId',
    skillId: 'activeSkillId',
  };
  const activeSkill = {
    id: 'activeSkillId',
    name: 'name activeSkillId',
    status: 'actif',
    pixValue: 2.9,
    version: 5,
    level: 2,
    hintStatus: 'hintStatus Acquis 0',
    competenceId: 'competenceId00',
    tubeId: 'tubeId00',
    tutorialIds: [],
    learningMoreTutorialIds: [],
    hint_i18n: { fr: 'hint FR activeSkillId', en: 'hint EN activeSkillId' },
  };
  const skillData00_tube00competence00_actif = {
    id: 'skillId00',
    name: 'name skillId00',
    status: 'actif',
    pixValue: 2.9,
    version: 5,
    level: 2,
    hintStatus: 'hintStatus Acquis 0',
    competenceId: 'competenceId00',
    tubeId: 'tubeId00',
    tutorialIds: [],
    learningMoreTutorialIds: [],
    hint_i18n: { fr: 'hint FR skillId00', en: 'hint EN skillId00' },
  };
  const challengeData04_skill01_qcu_valide_flashCompatible_ennl_noEmbedJson = {
    id: 'challengeId04',
    instruction: 'instruction challengeId04',
    alternativeInstruction: 'alternativeInstruction challengeId04',
    proposals: 'proposals challengeId04',
    type: 'QCU',
    solution: 'solution challengeId04',
    solutionToDisplay: 'solutionToDisplay challengeId04',
    t1Status: true,
    t2Status: false,
    t3Status: false,
    status: 'validé',
    genealogy: 'genealogy challengeId04',
    accessibility1: 'accessibility1 challengeId04',
    accessibility2: 'accessibility2 challengeId04',
    requireGafamWebsiteAccess: false,
    isIncompatibleIpadCertif: false,
    deafAndHardOfHearing: 'deafAndHardOfHearing challengeId04',
    isAwarenessChallenge: true,
    toRephrase: false,
    alternativeVersion: 10,
    shuffled: false,
    illustrationAlt: 'illustrationAlt challengeId04',
    illustrationUrl: 'illustrationUrl challengeId04',
    attachments: ['attachment1'],
    responsive: 'responsive challengeId04',
    alpha: 1.5,
    delta: 3.7,
    autoReply: true,
    focusable: false,
    format: 'format challengeId04',
    timer: 555,
    embedHeight: 804,
    embedUrl: 'embedUrl challengeId04',
    embedTitle: 'embedTitle challengeId04',
    locales: ['en', 'nl'],
    competenceId: 'competenceId00',
    skillId: 'skillId01',
  };
  const skillData01_tube01competence00_actif = {
    id: 'skillId01',
    name: 'name skillId01',
    status: 'actif',
    pixValue: 3.9,
    version: 5,
    level: 1,
    hintStatus: 'hintStatus Acquis 1',
    competenceId: 'competenceId00',
    tubeId: 'tubeId01',
    tutorialIds: [],
    learningMoreTutorialIds: [],
    hint_i18n: { fr: 'hint FR skillId01', en: 'hint EN skillId01' },
  };
  const challengeData05_skill02_qcm_perime_flashCompatible_fren_noEmbedJson = {
    id: 'challengeId05',
    instruction: 'instruction challengeId05',
    alternativeInstruction: 'alternativeInstruction challengeId05',
    proposals: 'proposals challengeId05',
    type: 'QCM',
    solution: 'solution challengeId05',
    solutionToDisplay: 'solutionToDisplay challengeId05',
    t1Status: true,
    t2Status: false,
    t3Status: true,
    status: 'périmé',
    genealogy: 'genealogy challengeId05',
    accessibility1: 'accessibility1 challengeId05',
    accessibility2: 'accessibility2 challengeId05',
    requireGafamWebsiteAccess: false,
    isIncompatibleIpadCertif: true,
    deafAndHardOfHearing: 'deafAndHardOfHearing challengeId05',
    isAwarenessChallenge: true,
    toRephrase: false,
    alternativeVersion: 10,
    shuffled: true,
    illustrationAlt: 'illustrationAlt challengeId05',
    illustrationUrl: 'illustrationUrl challengeId05',
    attachments: ['attachment1'],
    responsive: 'responsive challengeId05',
    alpha: 1.6,
    delta: 3.8,
    autoReply: true,
    focusable: true,
    format: 'format challengeId05',
    timer: null,
    embedHeight: 805,
    embedUrl: 'embedUrl challengeId05',
    embedTitle: 'embedTitle challengeId05',
    locales: ['en', 'fr'],
    competenceId: 'competenceId01',
    skillId: 'skillId02',
  };
  const challengeData06_skill02_qcm_perime_notFlashCompatible_fren_noEmbedJson = {
    id: 'challengeId06',
    instruction: 'instruction challengeId06',
    alternativeInstruction: 'alternativeInstruction challengeId06',
    proposals: 'proposals challengeId06',
    type: 'QCM',
    solution: 'solution challengeId06',
    solutionToDisplay: 'solutionToDisplay challengeId06',
    t1Status: true,
    t2Status: false,
    t3Status: true,
    status: 'périmé',
    genealogy: 'genealogy challengeId06',
    accessibility1: 'accessibility1 challengeId06',
    accessibility2: 'accessibility2 challengeId06',
    requireGafamWebsiteAccess: false,
    isIncompatibleIpadCertif: true,
    deafAndHardOfHearing: 'deafAndHardOfHearing challengeId06',
    isAwarenessChallenge: true,
    toRephrase: false,
    alternativeVersion: 10,
    shuffled: true,
    illustrationAlt: 'illustrationAlt challengeId06',
    illustrationUrl: 'illustrationUrl challengeId06',
    attachments: ['attachment1'],
    responsive: 'responsive challengeId06',
    alpha: null,
    delta: 3.8,
    autoReply: true,
    focusable: true,
    format: 'format challengeId06',
    timer: null,
    embedHeight: 806,
    embedUrl: 'embedUrl challengeId06',
    embedTitle: 'embedTitle challengeId06',
    locales: ['en', 'fr'],
    competenceId: 'competenceId01',
    skillId: 'skillId02',
  };
  const skillData02_tube02competence01_perime = {
    id: 'skillId02',
    name: 'name skillId02',
    status: 'périmé',
    pixValue: 2,
    version: 1,
    level: 3,
    hintStatus: 'hintStatus Acquis 2',
    competenceId: 'competenceId01',
    tubeId: 'tubeId02',
    tutorialIds: [],
    learningMoreTutorialIds: [],
    hint_i18n: { fr: 'hint FR skillId02', en: 'hint EN skillId02' },
  };
  const challengeData07_skill03_qcm_valide_notFlashCompatible_frnl_noEmbedJson = {
    id: 'challengeId07',
    instruction: 'instruction challengeId07',
    alternativeInstruction: 'alternativeInstruction challengeId07',
    proposals: 'proposals challengeId07',
    type: 'QCM',
    solution: 'solution challengeId07',
    solutionToDisplay: 'solutionToDisplay challengeId07',
    t1Status: true,
    t2Status: true,
    t3Status: true,
    status: 'validé',
    genealogy: 'genealogy challengeId07',
    accessibility1: 'accessibility1 challengeId07',
    accessibility2: 'accessibility2 challengeId07',
    requireGafamWebsiteAccess: false,
    isIncompatibleIpadCertif: true,
    deafAndHardOfHearing: 'deafAndHardOfHearing challengeId07',
    isAwarenessChallenge: true,
    toRephrase: false,
    alternativeVersion: 10,
    shuffled: true,
    illustrationAlt: 'illustrationAlt challengeId07',
    illustrationUrl: 'illustrationUrl challengeId07',
    attachments: ['attachment1'],
    responsive: 'responsive challengeId07',
    alpha: 0.8,
    delta: null,
    autoReply: false,
    focusable: true,
    format: 'format challengeId07',
    timer: null,
    embedHeight: null,
    embedUrl: 'embedUrl challengeId07',
    embedTitle: 'embedTitle challengeId07',
    locales: ['nl', 'fr'],
    competenceId: 'competenceId01',
    skillId: 'skillId03',
  };
  const challengeData08_skill03_qcu_archive_notFlashCompatible_fr_noEmbedJson = {
    id: 'challengeId08',
    instruction: 'instruction challengeId08',
    alternativeInstruction: 'alternativeInstruction challengeId08',
    proposals: 'proposals challengeId08',
    type: 'QCU',
    solution: 'solution challengeId08',
    solutionToDisplay: 'solutionToDisplay challengeId08',
    t1Status: false,
    t2Status: false,
    t3Status: true,
    status: 'archivé',
    genealogy: 'genealogy challengeId08',
    accessibility1: 'accessibility1 challengeId08',
    accessibility2: 'accessibility2 challengeId08',
    requireGafamWebsiteAccess: false,
    isIncompatibleIpadCertif: false,
    deafAndHardOfHearing: 'deafAndHardOfHearing challengeId08',
    isAwarenessChallenge: true,
    toRephrase: false,
    alternativeVersion: 10,
    shuffled: true,
    illustrationAlt: 'illustrationAlt challengeId08',
    illustrationUrl: 'illustrationUrl challengeId08',
    attachments: ['attachment1'],
    responsive: 'responsive challengeId08',
    alpha: null,
    delta: null,
    autoReply: false,
    focusable: true,
    format: 'format challengeId08',
    timer: null,
    embedHeight: null,
    embedUrl: 'embedUrl challengeId08',
    embedTitle: 'embedTitle challengeId08',
    locales: ['fr'],
    competenceId: 'competenceId01',
    skillId: 'skillId03',
  };
  const challengeData09_skill03_qcu_archive_flashCompatible_fr_noEmbedJson = {
    id: 'challengeId09',
    instruction: 'instruction challengeId09',
    alternativeInstruction: 'alternativeInstruction challengeId09',
    proposals: 'proposals challengeId09',
    type: 'QCU',
    solution: 'solution challengeId09',
    solutionToDisplay: 'solutionToDisplay challengeId09',
    t1Status: false,
    t2Status: false,
    t3Status: false,
    status: 'archivé',
    genealogy: 'genealogy challengeId09',
    accessibility1: 'accessibility1 challengeId09',
    accessibility2: 'accessibility2 challengeId09',
    requireGafamWebsiteAccess: true,
    isIncompatibleIpadCertif: false,
    deafAndHardOfHearing: 'deafAndHardOfHearing challengeId09',
    isAwarenessChallenge: true,
    toRephrase: false,
    alternativeVersion: 10,
    shuffled: true,
    illustrationAlt: 'illustrationAlt challengeId09',
    illustrationUrl: 'illustrationUrl challengeId09',
    attachments: ['attachment1'],
    responsive: 'responsive challengeId09',
    alpha: 1.0,
    delta: 2.0,
    autoReply: true,
    focusable: true,
    format: 'format challengeId09',
    timer: null,
    embedHeight: null,
    embedUrl: 'embedUrl challengeId09',
    embedTitle: 'embedTitle challengeId09',
    locales: ['fr'],
    competenceId: 'competenceId01',
    skillId: 'skillId03',
  };
  const skillData03_tube02competence01_actif = {
    id: 'skillId03',
    name: 'name skillId03',
    status: 'actif',
    pixValue: 5,
    version: 8,
    level: 7,
    hintStatus: 'hintStatus Acquis 3',
    competenceId: 'competenceId01',
    tubeId: 'tubeId03',
    tutorialIds: [],
    learningMoreTutorialIds: [],
    hint_i18n: { fr: 'hint FR skillId03', en: 'hint EN skillId03' },
  };

  beforeEach(async function () {
    databaseBuilder.factory.learningContent.build({
      skills: [
        skillData00_tube00competence00_actif,
        skillData01_tube01competence00_actif,
        skillData02_tube02competence01_perime,
        skillData03_tube02competence01_actif,
        activeSkill,
      ],
      challenges: [
        challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson,
        challengeData01_skill00_qcu_valide_flashCompatible_fren_withEmbedJson,
        challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson,
        challengeData03_skill00_qcm_valide_flashCompatible_nl_noEmbedJson,
        challengeData04_skill01_qcu_valide_flashCompatible_ennl_noEmbedJson,
        challengeData05_skill02_qcm_perime_flashCompatible_fren_noEmbedJson,
        challengeData06_skill02_qcm_perime_notFlashCompatible_fren_noEmbedJson,
        challengeData07_skill03_qcm_valide_notFlashCompatible_frnl_noEmbedJson,
        challengeData08_skill03_qcu_archive_notFlashCompatible_fr_noEmbedJson,
        challengeData09_skill03_qcu_archive_flashCompatible_fr_noEmbedJson,
        enArchivedChallenge,
        enValidatedChallenge,
        enTZArchivedChallenge,
        enTZValidatedChallenge,
        enUGValidatedChallenge,
        enUGArchivedChallenge,
      ],
    });
    await databaseBuilder.commit();
  });

  describe('#get', function () {
    context('when no challenge found for id', function () {
      it('should throw a NotFound error', async function () {
        // when
        const err = await catchErr(challengeRepository.get)('challengeIdPipeauPipette');

        // then
        expect(err).to.be.instanceOf(NotFoundError);
        expect(err).to.have.property('message', 'Épreuve introuvable');
      });
    });

    context('when challenge found for id', function () {
      context('when the challenge has an embed as webcomponent', function () {
        context('when retrieving the resource successfully', function () {
          it('should return the challenge with the loaded web component', async function () {
            // given
            const webComponentServerCall = nock('https://example.com')
              .get('/embed.json')
              .reply(200, JSON.stringify({ name: 'web-component', props: { prop1: 'value1', prop2: 'value2' } }), {
                'Content-Type': 'application/json',
              });

            // when
            const challenge = await challengeRepository.get('challengeId01');

            // then
            expect(webComponentServerCall.isDone()).to.equal(true);
            expect(challenge).to.deepEqualInstance(
              domainBuilder.buildChallenge({
                ...challengeData01_skill00_qcu_valide_flashCompatible_fren_withEmbedJson,
                blindnessCompatibility:
                  challengeData01_skill00_qcu_valide_flashCompatible_fren_withEmbedJson.accessibility1,
                colorBlindnessCompatibility:
                  challengeData01_skill00_qcu_valide_flashCompatible_fren_withEmbedJson.accessibility2,
                focused: challengeData01_skill00_qcu_valide_flashCompatible_fren_withEmbedJson.focusable,
                discriminant: challengeData01_skill00_qcu_valide_flashCompatible_fren_withEmbedJson.alpha,
                difficulty: challengeData01_skill00_qcu_valide_flashCompatible_fren_withEmbedJson.delta,
                validator: new ValidatorQCU({
                  solution: domainBuilder.buildSolution({
                    id: challengeData01_skill00_qcu_valide_flashCompatible_fren_withEmbedJson.id,
                    type: challengeData01_skill00_qcu_valide_flashCompatible_fren_withEmbedJson.type,
                    value: challengeData01_skill00_qcu_valide_flashCompatible_fren_withEmbedJson.solution,
                    isT1Enabled: challengeData01_skill00_qcu_valide_flashCompatible_fren_withEmbedJson.t1Status,
                    isT2Enabled: challengeData01_skill00_qcu_valide_flashCompatible_fren_withEmbedJson.t2Status,
                    isT3Enabled: challengeData01_skill00_qcu_valide_flashCompatible_fren_withEmbedJson.t3Status,
                    qrocBlocksTypes: {},
                  }),
                }),
                skill: domainBuilder.buildSkill({
                  ...skillData00_tube00competence00_actif,
                  difficulty: skillData00_tube00competence00_actif.level,
                  hint: skillData00_tube00competence00_actif.hint_i18n.fr,
                }),
                webComponentTagName: 'web-component',
                webComponentProps: { prop1: 'value1', prop2: 'value2' },
                hasEmbedInternalValidation: true,
                noValidationNeeded: true,
              }),
            );
          });
        });

        context('when we fail retrieving the resource', function () {
          it('should throw a NotFound error', async function () {
            // given
            const webComponentServerCall = nock('https://example.com').get('/embed.json').reply(404);

            // when
            const err = await catchErr(challengeRepository.get)('challengeId01');

            // then
            expect(webComponentServerCall.isDone()).to.equal(true);
            expect(err).to.be.instanceOf(NotFoundError);
            expect(err.message).to.equal(
              `Embed webcomponent config with URL ${challengeData01_skill00_qcu_valide_flashCompatible_fren_withEmbedJson.embedUrl} in challenge ${challengeData01_skill00_qcu_valide_flashCompatible_fren_withEmbedJson.id} not found`,
            );
          });
        });
      });

      context('when the challenge has no embed as webcomponent', function () {
        it('should return the challenge', async function () {
          // when
          const challenge = await challengeRepository.get('challengeId00');

          // then
          expect(challenge).to.deepEqualInstance(
            domainBuilder.buildChallenge({
              ...challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson,
              blindnessCompatibility:
                challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.accessibility1,
              colorBlindnessCompatibility:
                challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.accessibility2,
              focused: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.focusable,
              discriminant: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.alpha,
              difficulty: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.delta,
              validator: new ValidatorQCU({
                solution: domainBuilder.buildSolution({
                  id: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.id,
                  type: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.type,
                  value: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.solution,
                  isT1Enabled: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.t1Status,
                  isT2Enabled: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.t2Status,
                  isT3Enabled: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.t3Status,
                  qrocBlocksTypes: {},
                }),
              }),
              skill: domainBuilder.buildSkill({
                ...skillData00_tube00competence00_actif,
                difficulty: skillData00_tube00competence00_actif.level,
                hint: skillData00_tube00competence00_actif.hint_i18n.fr,
              }),
              hasEmbedInternalValidation: true,
              noValidationNeeded: true,
            }),
          );
        });
      });

      context('when asking a challenge "for correction"', function () {
        it('should return a dedicated DTO for correction', async function () {
          // when
          const challengeForCorrection = await challengeRepository.get('challengeId00', { forCorrection: true });

          // then
          expect(challengeForCorrection).to.deep.equal({
            id: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.id,
            skillId: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.skillId,
            type: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.type,
            solution: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.solution,
            solutionToDisplay: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.solutionToDisplay,
            proposals: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.proposals,
            t1Status: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.t1Status,
            t2Status: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.t2Status,
            t3Status: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.t3Status,
          });
        });
      });
    });
  });

  describe('#get_proxy', function () {
    context('when no challenge found for id', function () {
      it('should throw a NotFound error', async function () {
        // when
        const err = await catchErr(challengeRepository.get_proxy)('challengeIdPipeauPipette');

        // then
        expect(err).to.be.instanceOf(NotFoundError);
        expect(err).to.have.property('message', 'Épreuve introuvable');
      });
    });

    context('when challenge found for id', function () {
      it('should return the challenge', async function () {
        // when
        const challenge = await challengeRepository.get_proxy('challengeId00');

        // then
        expect(challenge).to.deepEqualInstance(
          domainBuilder.learningContent.buildChallenge(
            challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson,
          ),
        );
      });
    });
  });

  describe('#getMany', function () {
    context('when no locale provided', function () {
      context('when at least one challenge is not found amongst the provided ids', function () {
        it('should throw a NotFound error', async function () {
          // when
          const err = await catchErr(challengeRepository.getMany)(['challengeIdPipeauPipette', 'challengeId00']);

          // then
          expect(err).to.be.instanceOf(NotFoundError);
          expect(err).to.have.property('message', 'Épreuve introuvable');
        });
      });

      context('when all challenges are found', function () {
        it('should return the challenges', async function () {
          // when
          const challenges = await challengeRepository.getMany(['challengeId02', 'challengeId00']);

          // then
          expect(challenges).to.deepEqualArray([
            domainBuilder.buildChallenge({
              ...challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson,
              blindnessCompatibility:
                challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.accessibility1,
              colorBlindnessCompatibility:
                challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.accessibility2,
              focused: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.focusable,
              discriminant: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.alpha,
              difficulty: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.delta,
              validator: new ValidatorQCU({
                solution: domainBuilder.buildSolution({
                  id: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.id,
                  type: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.type,
                  value: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.solution,
                  isT1Enabled: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.t1Status,
                  isT2Enabled: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.t2Status,
                  isT3Enabled: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.t3Status,
                  qrocBlocksTypes: {},
                }),
              }),
              skill: domainBuilder.buildSkill({
                ...skillData00_tube00competence00_actif,
                difficulty: skillData00_tube00competence00_actif.level,
                hint: skillData00_tube00competence00_actif.hint_i18n.fr,
              }),
            }),
            domainBuilder.buildChallenge({
              ...challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson,
              blindnessCompatibility: challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.accessibility1,
              colorBlindnessCompatibility:
                challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.accessibility2,
              focused: challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.focusable,
              discriminant: challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.alpha,
              difficulty: challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.delta,
              validator: new ValidatorQCM({
                solution: domainBuilder.buildSolution({
                  id: challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.id,
                  type: challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.type,
                  value: challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.solution,
                  isT1Enabled: challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.t1Status,
                  isT2Enabled: challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.t2Status,
                  isT3Enabled: challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.t3Status,
                  qrocBlocksTypes: {},
                }),
              }),
              skill: domainBuilder.buildSkill({
                ...skillData00_tube00competence00_actif,
                difficulty: skillData00_tube00competence00_actif.level,
                hint: skillData00_tube00competence00_actif.hint_i18n.fr,
              }),
            }),
          ]);
        });

        it('should allow duplicates', async function () {
          // when
          const challenges = await challengeRepository.getMany(['challengeId02', 'challengeId00', 'challengeId02']);

          // then
          expect(challenges).to.deepEqualArray([
            domainBuilder.buildChallenge({
              ...challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson,
              blindnessCompatibility:
                challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.accessibility1,
              colorBlindnessCompatibility:
                challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.accessibility2,
              focused: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.focusable,
              discriminant: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.alpha,
              difficulty: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.delta,
              validator: new ValidatorQCU({
                solution: domainBuilder.buildSolution({
                  id: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.id,
                  type: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.type,
                  value: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.solution,
                  isT1Enabled: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.t1Status,
                  isT2Enabled: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.t2Status,
                  isT3Enabled: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.t3Status,
                  qrocBlocksTypes: {},
                }),
              }),
              skill: domainBuilder.buildSkill({
                ...skillData00_tube00competence00_actif,
                difficulty: skillData00_tube00competence00_actif.level,
                hint: skillData00_tube00competence00_actif.hint_i18n.fr,
              }),
            }),
            domainBuilder.buildChallenge({
              ...challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson,
              blindnessCompatibility: challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.accessibility1,
              colorBlindnessCompatibility:
                challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.accessibility2,
              focused: challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.focusable,
              discriminant: challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.alpha,
              difficulty: challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.delta,
              validator: new ValidatorQCM({
                solution: domainBuilder.buildSolution({
                  id: challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.id,
                  type: challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.type,
                  value: challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.solution,
                  isT1Enabled: challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.t1Status,
                  isT2Enabled: challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.t2Status,
                  isT3Enabled: challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.t3Status,
                  qrocBlocksTypes: {},
                }),
              }),
              skill: domainBuilder.buildSkill({
                ...skillData00_tube00competence00_actif,
                difficulty: skillData00_tube00competence00_actif.level,
                hint: skillData00_tube00competence00_actif.hint_i18n.fr,
              }),
            }),
            domainBuilder.buildChallenge({
              ...challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson,
              blindnessCompatibility: challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.accessibility1,
              colorBlindnessCompatibility:
                challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.accessibility2,
              focused: challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.focusable,
              discriminant: challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.alpha,
              difficulty: challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.delta,
              validator: new ValidatorQCM({
                solution: domainBuilder.buildSolution({
                  id: challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.id,
                  type: challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.type,
                  value: challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.solution,
                  isT1Enabled: challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.t1Status,
                  isT2Enabled: challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.t2Status,
                  isT3Enabled: challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.t3Status,
                  qrocBlocksTypes: {},
                }),
              }),
              skill: domainBuilder.buildSkill({
                ...skillData00_tube00competence00_actif,
                difficulty: skillData00_tube00competence00_actif.level,
                hint: skillData00_tube00competence00_actif.hint_i18n.fr,
              }),
            }),
          ]);
        });
      });
    });

    context('when locale is provided', function () {
      context('when at least one challenge is not found amongst the provided ids', function () {
        it('should throw a NotFound error', async function () {
          // when
          const err = await catchErr(challengeRepository.getMany)(['challengeIdPipeauPipette', 'challengeId00']);

          // then
          expect(err).to.be.instanceOf(NotFoundError);
          expect(err).to.have.property('message', 'Épreuve introuvable');
        });
      });

      context('when all challenges are found', function () {
        it('should return only the challenges for given locale', async function () {
          // when
          const challenges = await challengeRepository.getMany(
            ['challengeId02', 'challengeId00', 'challengeId01'],
            'en',
          );

          // then
          expect(challenges).to.deepEqualArray([
            domainBuilder.buildChallenge({
              ...challengeData01_skill00_qcu_valide_flashCompatible_fren_withEmbedJson,
              blindnessCompatibility:
                challengeData01_skill00_qcu_valide_flashCompatible_fren_withEmbedJson.accessibility1,
              colorBlindnessCompatibility:
                challengeData01_skill00_qcu_valide_flashCompatible_fren_withEmbedJson.accessibility2,
              focused: challengeData01_skill00_qcu_valide_flashCompatible_fren_withEmbedJson.focusable,
              discriminant: challengeData01_skill00_qcu_valide_flashCompatible_fren_withEmbedJson.alpha,
              difficulty: challengeData01_skill00_qcu_valide_flashCompatible_fren_withEmbedJson.delta,
              validator: new ValidatorQCU({
                solution: domainBuilder.buildSolution({
                  id: challengeData01_skill00_qcu_valide_flashCompatible_fren_withEmbedJson.id,
                  type: challengeData01_skill00_qcu_valide_flashCompatible_fren_withEmbedJson.type,
                  value: challengeData01_skill00_qcu_valide_flashCompatible_fren_withEmbedJson.solution,
                  isT1Enabled: challengeData01_skill00_qcu_valide_flashCompatible_fren_withEmbedJson.t1Status,
                  isT2Enabled: challengeData01_skill00_qcu_valide_flashCompatible_fren_withEmbedJson.t2Status,
                  isT3Enabled: challengeData01_skill00_qcu_valide_flashCompatible_fren_withEmbedJson.t3Status,
                  qrocBlocksTypes: {},
                }),
              }),
              skill: domainBuilder.buildSkill({
                ...skillData00_tube00competence00_actif,
                difficulty: skillData00_tube00competence00_actif.level,
                hint: skillData00_tube00competence00_actif.hint_i18n.fr,
              }),
            }),
            domainBuilder.buildChallenge({
              ...challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson,
              blindnessCompatibility: challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.accessibility1,
              colorBlindnessCompatibility:
                challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.accessibility2,
              focused: challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.focusable,
              discriminant: challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.alpha,
              difficulty: challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.delta,
              validator: new ValidatorQCM({
                solution: domainBuilder.buildSolution({
                  id: challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.id,
                  type: challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.type,
                  value: challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.solution,
                  isT1Enabled: challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.t1Status,
                  isT2Enabled: challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.t2Status,
                  isT3Enabled: challengeData02_skill00_qcm_archive_flashCompatible_en_noEmbedJson.t3Status,
                  qrocBlocksTypes: {},
                }),
              }),
              skill: domainBuilder.buildSkill({
                ...skillData00_tube00competence00_actif,
                difficulty: skillData00_tube00competence00_actif.level,
                hint: skillData00_tube00competence00_actif.hint_i18n.fr,
              }),
            }),
          ]);
        });
      });
    });
  });

  describe('#findValidated', function () {
    context('when locale is not defined', function () {
      it('should throw an Error', async function () {
        // when
        const err = await catchErr(challengeRepository.findValidated)();

        // then
        expect(err.message).to.equal('Locale shall be defined');
      });
    });

    context('when locale is defined', function () {
      context('when no validated challenges found for given locale', function () {
        it('should return an empty array', async function () {
          // when
          const challenges = await challengeRepository.findValidated('catalan');

          // then
          expect(challenges).to.deep.equal([]);
        });
      });

      context('when validated challenges are found for given locale', function () {
        it('should return the challenges', async function () {
          // when
          const challenges = await challengeRepository.findValidated('nl');

          // then
          expect(challenges).to.deep.equal([
            domainBuilder.buildChallenge({
              ...challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson,
              blindnessCompatibility:
                challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.accessibility1,
              colorBlindnessCompatibility:
                challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.accessibility2,
              focused: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.focusable,
              discriminant: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.alpha,
              difficulty: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.delta,
              validator: new ValidatorQCU({
                solution: domainBuilder.buildSolution({
                  id: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.id,
                  type: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.type,
                  value: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.solution,
                  isT1Enabled: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.t1Status,
                  isT2Enabled: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.t2Status,
                  isT3Enabled: challengeData00_skill00_qcu_valide_flashCompatible_frnl_noEmbedJson.t3Status,
                  qrocBlocksTypes: {},
                }),
              }),
              skill: domainBuilder.buildSkill({
                ...skillData00_tube00competence00_actif,
                difficulty: skillData00_tube00competence00_actif.level,
                hint: skillData00_tube00competence00_actif.hint_i18n.fr,
              }),
            }),
            domainBuilder.buildChallenge({
              ...challengeData03_skill00_qcm_valide_flashCompatible_nl_noEmbedJson,
              blindnessCompatibility: challengeData03_skill00_qcm_valide_flashCompatible_nl_noEmbedJson.accessibility1,
              colorBlindnessCompatibility:
                challengeData03_skill00_qcm_valide_flashCompatible_nl_noEmbedJson.accessibility2,
              focused: challengeData03_skill00_qcm_valide_flashCompatible_nl_noEmbedJson.focusable,
              discriminant: challengeData03_skill00_qcm_valide_flashCompatible_nl_noEmbedJson.alpha,
              difficulty: challengeData03_skill00_qcm_valide_flashCompatible_nl_noEmbedJson.delta,
              validator: new ValidatorQCM({
                solution: domainBuilder.buildSolution({
                  id: challengeData03_skill00_qcm_valide_flashCompatible_nl_noEmbedJson.id,
                  type: challengeData03_skill00_qcm_valide_flashCompatible_nl_noEmbedJson.type,
                  value: challengeData03_skill00_qcm_valide_flashCompatible_nl_noEmbedJson.solution,
                  isT1Enabled: challengeData03_skill00_qcm_valide_flashCompatible_nl_noEmbedJson.t1Status,
                  isT2Enabled: challengeData03_skill00_qcm_valide_flashCompatible_nl_noEmbedJson.t2Status,
                  isT3Enabled: challengeData03_skill00_qcm_valide_flashCompatible_nl_noEmbedJson.t3Status,
                  qrocBlocksTypes: {},
                }),
              }),
              skill: domainBuilder.buildSkill({
                ...skillData00_tube00competence00_actif,
                difficulty: skillData00_tube00competence00_actif.level,
                hint: skillData00_tube00competence00_actif.hint_i18n.fr,
              }),
            }),
            domainBuilder.buildChallenge({
              ...challengeData04_skill01_qcu_valide_flashCompatible_ennl_noEmbedJson,
              blindnessCompatibility:
                challengeData04_skill01_qcu_valide_flashCompatible_ennl_noEmbedJson.accessibility1,
              colorBlindnessCompatibility:
                challengeData04_skill01_qcu_valide_flashCompatible_ennl_noEmbedJson.accessibility2,
              focused: challengeData04_skill01_qcu_valide_flashCompatible_ennl_noEmbedJson.focusable,
              discriminant: challengeData04_skill01_qcu_valide_flashCompatible_ennl_noEmbedJson.alpha,
              difficulty: challengeData04_skill01_qcu_valide_flashCompatible_ennl_noEmbedJson.delta,
              validator: new ValidatorQCU({
                solution: domainBuilder.buildSolution({
                  id: challengeData04_skill01_qcu_valide_flashCompatible_ennl_noEmbedJson.id,
                  type: challengeData04_skill01_qcu_valide_flashCompatible_ennl_noEmbedJson.type,
                  value: challengeData04_skill01_qcu_valide_flashCompatible_ennl_noEmbedJson.solution,
                  isT1Enabled: challengeData04_skill01_qcu_valide_flashCompatible_ennl_noEmbedJson.t1Status,
                  isT2Enabled: challengeData04_skill01_qcu_valide_flashCompatible_ennl_noEmbedJson.t2Status,
                  isT3Enabled: challengeData04_skill01_qcu_valide_flashCompatible_ennl_noEmbedJson.t3Status,
                  qrocBlocksTypes: {},
                }),
              }),
              skill: domainBuilder.buildSkill({
                ...skillData01_tube01competence00_actif,
                difficulty: skillData01_tube01competence00_actif.level,
                hint: skillData01_tube01competence00_actif.hint_i18n.fr,
              }),
            }),
            domainBuilder.buildChallenge({
              ...challengeData07_skill03_qcm_valide_notFlashCompatible_frnl_noEmbedJson,
              blindnessCompatibility:
                challengeData07_skill03_qcm_valide_notFlashCompatible_frnl_noEmbedJson.accessibility1,
              colorBlindnessCompatibility:
                challengeData07_skill03_qcm_valide_notFlashCompatible_frnl_noEmbedJson.accessibility2,
              focused: challengeData07_skill03_qcm_valide_notFlashCompatible_frnl_noEmbedJson.focusable,
              discriminant: challengeData07_skill03_qcm_valide_notFlashCompatible_frnl_noEmbedJson.alpha,
              difficulty: challengeData07_skill03_qcm_valide_notFlashCompatible_frnl_noEmbedJson.delta,
              validator: new ValidatorQCM({
                solution: domainBuilder.buildSolution({
                  id: challengeData07_skill03_qcm_valide_notFlashCompatible_frnl_noEmbedJson.id,
                  type: challengeData07_skill03_qcm_valide_notFlashCompatible_frnl_noEmbedJson.type,
                  value: challengeData07_skill03_qcm_valide_notFlashCompatible_frnl_noEmbedJson.solution,
                  isT1Enabled: challengeData07_skill03_qcm_valide_notFlashCompatible_frnl_noEmbedJson.t1Status,
                  isT2Enabled: challengeData07_skill03_qcm_valide_notFlashCompatible_frnl_noEmbedJson.t2Status,
                  isT3Enabled: challengeData07_skill03_qcm_valide_notFlashCompatible_frnl_noEmbedJson.t3Status,
                  qrocBlocksTypes: {},
                }),
              }),
              skill: domainBuilder.buildSkill({
                ...skillData03_tube02competence01_actif,
                difficulty: skillData03_tube02competence01_actif.level,
                hint: skillData03_tube02competence01_actif.hint_i18n.fr,
              }),
            }),
          ]);
        });
      });
    });
  });

  describe('#findValidatedByCompetenceId_proxy', function () {
    context('when locale is not defined', function () {
      it('should throw an Error', async function () {
        // when
        const err = await catchErr(challengeRepository.findValidatedByCompetenceId_proxy)('competenceId00');

        // then
        expect(err.message).to.equal('Locale shall be defined');
      });
    });

    context('when locale is defined', function () {
      context('when no validated challenges found for given locale and competenceId', function () {
        it('should return an empty array', async function () {
          // when
          const challenges = await challengeRepository.findValidatedByCompetenceId_proxy('competenceId00', 'es');

          // then
          expect(challenges).to.deep.equal([]);
        });
      });

      context('when validated challenges are found for given locale and competenceId', function () {
        it('should return the challenges', async function () {
          // when
          const challenges = await challengeRepository.findValidatedByCompetenceId_proxy('competenceId00', 'en');

          // then
          expect(challenges).to.deep.equal([
            domainBuilder.learningContent.buildChallenge(
              challengeData01_skill00_qcu_valide_flashCompatible_fren_withEmbedJson,
            ),
            domainBuilder.learningContent.buildChallenge(
              challengeData04_skill01_qcu_valide_flashCompatible_ennl_noEmbedJson,
            ),
          ]);
        });
      });
    });
  });

  describe('#findOperativeBySkillsAndLocales_proxy', function () {
    context('when locale is defined', function () {
      context('when no operative challenges found for given locale', function () {
        it('should return an empty array', async function () {
          // given
          const skill00 = domainBuilder.buildSkill({
            ...skillData00_tube00competence00_actif,
            difficulty: skillData00_tube00competence00_actif.level,
            hint: skillData00_tube00competence00_actif.hint_i18n.fr,
          });

          // when
          const challenges = await challengeRepository.findOperativeBySkillsAndLocales_proxy([skill00], ['catalan']);

          // then
          expect(challenges).to.deep.equal([]);
        });
      });

      context('when searching for en-TZ and en operative challenges', function () {
        it('should return the challenges having en-TZ or en included in their locales', async function () {
          // given
          const skills = [
            domainBuilder.buildSkill({
              ...activeSkill,
              difficulty: activeSkill.level,
              hint: activeSkill.hint_i18n.fr,
            }),
          ];

          // when
          const challenges = await challengeRepository.findOperativeBySkillsAndLocales_proxy(skills, ['en-TZ', 'en']);
          // then
          expect(challenges).to.deep.equal([
            domainBuilder.learningContent.buildChallenge(enArchivedChallenge),
            domainBuilder.learningContent.buildChallenge(enTZArchivedChallenge),
            domainBuilder.learningContent.buildChallenge(enTZValidatedChallenge),
            domainBuilder.learningContent.buildChallenge(enUGValidatedChallenge),
            domainBuilder.learningContent.buildChallenge(enValidatedChallenge),
          ]);
        });
      });
    });
  });

  describe('#findValidatedIdsByTubeIdsAndLocales', function () {
    it('returns challenge IDS that belong to given tube IDS and are of the languages given in parameters', async function () {
      databaseBuilder.factory.learningContent.build({
        skills: [
          { id: 'skillOk1', tubeId: 'tubeOk1', status: 'actif' },
          { id: 'skillOk2', tubeId: 'tubeOk2', status: 'actif' },
        ],
        challenges: [
          { id: 'challengeOk1', skillId: 'skillOk1', locales: [FRENCH_SPOKEN], status: 'validé' },
          { id: 'challengeOk2', skillId: 'skillOk2', locales: [FRENCH_SPOKEN], status: 'validé' },
          { id: 'challengeKo3', skillId: 'skillOk2', locales: [ENGLISH_SPOKEN], status: 'validé' },
        ],
      });
      await databaseBuilder.commit();

      const challengeIds = await challengeRepository.findValidatedIdsByTubeIdsAndLocales(
        ['tubeOk1', 'tubeOk2'],
        [FRENCH_SPOKEN],
      );

      expect(challengeIds).to.deep.equal(['challengeOk1', 'challengeOk2']);
    });

    it('ignores valid challenges when not in given tube IDS', async function () {
      databaseBuilder.factory.learningContent.build({
        skills: [
          { id: 'skillOk', tubeId: 'tubeOk', status: 'actif' },
          { id: 'skillNotInTubeIds', tubeId: 'someOtherTube', status: 'actif' },
        ],
        challenges: [
          { id: 'challengeOk', skillId: 'skillOk', locales: [FRENCH_SPOKEN], status: 'validé' },
          { id: 'challengeNotInTubeIds', skillId: 'skillNotInTubeIds', locales: [FRENCH_SPOKEN], status: 'validé' },
        ],
      });
      await databaseBuilder.commit();

      const challengeIds = await challengeRepository.findValidatedIdsByTubeIdsAndLocales(['tubeOk'], [FRENCH_SPOKEN]);

      expect(challengeIds).to.deep.equal(['challengeOk']);
    });

    it('ignores valid challenges when not in given locales', async function () {
      databaseBuilder.factory.learningContent.build({
        skills: [{ id: 'skillOk', tubeId: 'tubeOk', status: 'actif' }],
        challenges: [
          { id: 'challengeOkFr', skillId: 'skillOk', locales: [FRENCH_SPOKEN], status: 'validé' },
          { id: 'challengeOkEn', skillId: 'skillOk', locales: [ENGLISH_SPOKEN], status: 'validé' },
          { id: 'challengeOkNl', skillId: 'skillOk', locales: ['nl'], status: 'validé' },
        ],
      });
      await databaseBuilder.commit();

      const challengeIds = await challengeRepository.findValidatedIdsByTubeIdsAndLocales(
        ['tubeOk'],
        [FRENCH_SPOKEN, 'nl'],
      );

      expect(challengeIds).to.deep.equal(['challengeOkFr', 'challengeOkNl']);
    });

    it('ignores challenges when skill is not active', async function () {
      databaseBuilder.factory.learningContent.build({
        skills: [{ id: 'skillKo', tubeId: 'tubeOk', status: 'archivé' }],
        challenges: [{ id: 'challengeOkFr', skillId: 'skillOk', locales: [FRENCH_SPOKEN], status: 'validé' }],
      });
      await databaseBuilder.commit();

      const challengeIds = await challengeRepository.findValidatedIdsByTubeIdsAndLocales(['tubeOk'], [FRENCH_SPOKEN]);

      expect(challengeIds).to.deep.equal([]);
    });

    it('ignores challenges when challenge is not validated', async function () {
      databaseBuilder.factory.learningContent.build({
        skills: [{ id: 'skillOk', tubeId: 'tubeOk', status: 'actif' }],
        challenges: [
          { id: 'challengeOk', skillId: 'skillOk', locales: [FRENCH_SPOKEN], status: 'validé' },
          { id: 'challengeKo', skillId: 'skillOk', locales: [FRENCH_SPOKEN], status: 'archivé' },
        ],
      });
      await databaseBuilder.commit();

      const challengeIds = await challengeRepository.findValidatedIdsByTubeIdsAndLocales(['tubeOk'], [FRENCH_SPOKEN]);

      expect(challengeIds).to.deep.equal(['challengeOk']);
    });
  });
});
