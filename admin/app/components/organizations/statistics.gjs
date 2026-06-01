import PixIndicatorCard from '@1024pix/pix-ui/components/pix-indicator-card';
import { t } from 'ember-intl';

<template>
  <section>
    <PixIndicatorCard
      class="organization-statistics__card"
      @title={{t "components.organizations.statistics.total-participants-count.title"}}
      @color="tertiary"
      @iconName="users"
      @info={{t "components.organizations.statistics.total-participants-count.info"}}
    >
      {{@statistics.totalParticipantsCount}}

    </PixIndicatorCard>

  </section>
</template>
