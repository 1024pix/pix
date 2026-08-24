import { PixIndicatorCard } from '@1024pix/nebulix-ember';
import { t } from 'ember-intl';
<template>
  <section>
    <h2 class="organization-information__title">{{t "components.index.organization-information.title"}}</h2>

    <PixIndicatorCard
      @title={{t "components.index.organization-information.label"}}
      @color="primary"
      @iconName="buildings"
    >
      <:default>
        {{@organizationName}}
      </:default>
    </PixIndicatorCard>
  </section>
</template>
