import CertificationScoringConfiguration from './certification-scoring-configuration';
import CompetenceScoringConfiguration from './competence-scoring-configuration';
import FlashAlgorithmConfiguration from './flash-algorithm-configuration';
import ScoringSimulator from './scoring-simulator';

<template>
  <CertificationScoringConfiguration />
  <CompetenceScoringConfiguration />
  <FlashAlgorithmConfiguration @model={{@model}} />
  <ScoringSimulator />
</template>
