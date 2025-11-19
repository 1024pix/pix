import Cgu from 'pix-admin/components/users/cgu';
<template>
  <section class="page-section">
    <Cgu
      @cgu={{@model.cgu}}
      @pixOrgaTermsOfServiceAccepted={{@model.pixOrgaTermsOfServiceAccepted}}
      @pixCertifTermsOfServiceAccepted={{@model.pixCertifTermsOfServiceAccepted}}
      @lastTermsOfServiceValidatedAt={{@model.lastTermsOfServiceValidatedAt}}
      @lastPixOrgaTermsOfServiceValidatedAt={{@model.lastPixOrgaTermsOfServiceValidatedAt}}
      @lastPixCertifTermsOfServiceValidatedAt={{@model.lastPixCertifTermsOfServiceValidatedAt}}
    />
  </section>
</template>
