import CertificationScoringConfiguration from './certification-scoring-configuration';
import CompetenceScoringConfiguration from './competence-scoring-configuration';
import FlashAlgorithmConfiguration from './flash-algorithm-configuration';
import ScoWhitelistConfiguration from './sco-whitelist-configuration';
import ScoringSimulator from './scoring-simulator';

<template>
  <ScoWhitelistConfiguration />
  <CertificationScoringConfiguration />
  <CompetenceScoringConfiguration />
  <FlashAlgorithmConfiguration @model={{@model}} />
  <ScoringSimulator />
</template>
