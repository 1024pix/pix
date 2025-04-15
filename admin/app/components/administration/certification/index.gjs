import CertificationScoringConfiguration from './certification-scoring-configuration';
import CompetenceScoringConfiguration from './competence-scoring-configuration';
import FlashAlgorithmConfiguration from './flash-algorithm-configuration';
import ScoWhitelistConfiguration from './sco-whitelist-configuration';

<template>
  <ScoWhitelistConfiguration />
  <CertificationScoringConfiguration />
  <CompetenceScoringConfiguration />
  <FlashAlgorithmConfiguration @model={{@model}} />
</template>
