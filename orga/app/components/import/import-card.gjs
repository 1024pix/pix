<template>
  <section class="import-card">
    <h2 class="import-card__title">{{@cardTitle}}</h2>
    <div class="import-card__details">
      {{yield to="cardDetails"}}
    </div>

    <div class="import-card__footer">
      {{yield to="cardFooter"}}
    </div>
  </section>
</template>
