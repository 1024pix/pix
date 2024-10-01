import PixBackgroundHeader from '@1024pix/pix-ui/components/pix-background-header';
import PixBlock from '@1024pix/pix-ui/components/pix-block';

import CertificationStarter from '../certification-starter';
import CompanionBlocker from '../companion/blocker';
import Footer from '../footer';
import NavbarHeader from '../navbar-header';

<template>
  <CompanionBlocker>
    <header role="banner">
      <NavbarHeader />
    </header>

    <main class="main" role="main">
      <PixBackgroundHeader id="main">
        <PixBlock @shadow="heavy" class="certification-start-page__block">
          <CertificationStarter @certificationCandidateSubscription={{@certificationCandidateSubscription}} />
        </PixBlock>
      </PixBackgroundHeader>
    </main>

    <Footer />
  </CompanionBlocker>
</template>
