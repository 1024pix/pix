import Cgu from 'pix-admin/components/users/cgu';
<template>
  <section class="page-section">
    <Cgu
      @pixAppTermsOfServiceAccepted={{@model.pixAppTermsOfServiceAccepted}}
      @pixOrgaTermsOfServiceAccepted={{@model.pixOrgaTermsOfServiceAccepted}}
      @pixCertifTermsOfServiceAccepted={{@model.pixCertifTermsOfServiceAccepted}}
      @lastPixAppTermsOfServiceValidatedAt={{@model.lastPixAppTermsOfServiceValidatedAt}}
      @lastPixOrgaTermsOfServiceValidatedAt={{@model.lastPixOrgaTermsOfServiceValidatedAt}}
      @lastPixCertifTermsOfServiceValidatedAt={{@model.lastPixCertifTermsOfServiceValidatedAt}}
    />
  </section>
</template>
