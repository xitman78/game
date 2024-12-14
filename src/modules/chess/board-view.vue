<script setup lang="ts">
import { type Board } from './board';

const { model } = defineProps<{ model: Board }>();
const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const numbers = [8, 7, 6, 5, 4, 3, 2, 1];
</script>

<template>
  <div class="board-outer">
    <div></div>
    <div class="board-side row">
      <span v-for="i in letters" :key="i">{{ i }}</span>
    </div>
    <div></div>
    <div class="board-side col">
      <span v-for="i in numbers" :key="i">{{ i }}</span>
    </div>
    <div class="relative">
      <ui-item class="board-inner" :model="model.root" />
    </div>
    <div class="board-side col">
      <span v-for="i in numbers" :key="i">{{ i }}</span>
    </div>
    <div></div>
    <div class="board-side row">
      <span v-for="i in letters" :key="i">{{ i }}</span>
    </div>
    <div></div>
  </div>
</template>

<style lang="scss">
.board-outer {
  position: relative;
  width: min(75vw, 75vh);
  aspect-ratio: 1;
  border: 3px solid rgb(var(--border));
  display: grid;
  grid-template-columns: 2em 1fr 2em;
  grid-template-rows: 2em 1fr 2em;
}

.board-inner {
  position: absolute;
  inset: 0;
}

.board-side {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.dark { fill: rgb(64 16 16); }
.light { fill: rgb(128 128 128); }
.black { fill: black; }
.white { fill: white; }
</style>
