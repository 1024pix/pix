import AttachBadges from 'pix-admin/components/complementary-certifications/attach-badges/index';
<template>
  <AttachBadges
    @complementaryCertification={{@model.complementaryCertification}}
    @currentTargetProfile={{@model.currentTargetProfile}}
  />
</template>
