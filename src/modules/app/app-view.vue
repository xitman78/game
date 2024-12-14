<script setup lang="ts">
import { type App } from './app';

const { model } = defineProps<{ model: App }>();
</script>

<template>
  <div class="flex col gap-4">
    <h1>Workin</h1>
    <div class="flex row ai-center gap-4">
      <ui-button class="btn" @click="model.reset()">reset</ui-button>
      <div>
        turn: {{ model.chess.turn }}
      </div>
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
</style>
