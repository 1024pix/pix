import CertificationStarter from '../certification-starter';
import CompanionBlocker from '../companion/blocker';

<template>
  <CompanionBlocker>
    <main class="certification-start-page" role="main">
      <CertificationStarter @model={{@model}} />
    </main>
  </CompanionBlocker>
</template>
