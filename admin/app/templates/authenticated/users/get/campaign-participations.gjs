import CampaignParticipations from 'pix-admin/components/users/campaign-participations';
<template>
  <section class="page-section">
    <CampaignParticipations @participations={{@model}} @removeParticipation={{@controller.removeParticipation}} />
  </section>
</template>
