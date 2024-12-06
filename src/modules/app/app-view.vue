<script setup lang="ts">
import {type App} from './app'

const { model } = defineProps<{ model: App }>();
</script>

<template>
  <div class="flex col gap-1em">
    <h1>Workin</h1>
    <div class="flex row gap-1em">
      <ui-button
        v-for="n in [[0, 1], [1, 7], [7, 6], [6, 0]]"
        :key="n[0]"
        class="btn"
        @click="model.test(n[0], n[1])"
      >
        test({{ n[0] }}, {{ n[1] }})
      </ui-button>
    </div>
    <board-view :model="model.board" />
  </div>
</template>

<style lang="scss">
#app {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gap-1em {
  gap: 1em;
}

:root {
  --dark: 64 16 16;
  --light: 128 128 128;
}

.dark {
  fill: rgb(var(--dark));
}
.light {
  fill: rgb(var(--light));
}
</style>
