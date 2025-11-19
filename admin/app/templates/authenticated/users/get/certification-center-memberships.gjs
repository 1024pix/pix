import Memberships from 'pix-admin/components/users/certification-centers/memberships';
<template>
  <section class="page-section">
    <Memberships
      @certificationCenterMemberships={{@model}}
      @onCertificationCenterMembershipRoleChange={{@controller.updateCertificationCenterMembershipRole}}
      @disableCertificationCenterMembership={{@controller.disableCertificationCenterMembership}}
    />
  </section>
</template>
