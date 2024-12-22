<script setup lang="ts">
import { type App } from './app';

const { model } = defineProps<{ model: App }>();

function escape(e: KeyboardEvent) {
  if (e.code === 'Escape') {
    model.ok();
  }
}

const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const numbers = [8, 7, 6, 5, 4, 3, 2, 1];
</script>

<template>
  <div class="flex col gap-4">
    <teleport to="body">
      <ui-dialog :model="model.dialog" class="figure-selector-dialog" @keydown="escape">
        <div class="dlg-panel">
          <h2>{{ model.chess.turn }} win!</h2>
          <ui-button class="btn" @click="model.ok()">ok</ui-button>
        </div>
      </ui-dialog>
    </teleport>
    <div class="header">
      <h2>{{ model.chess.turn }} turn</h2>
      <ui-button class="btn" @click="model.reset()">reset</ui-button>
    </div>
    <div class="grid">
      <picker-view class="pick-white" :model="model.picker" :color="'white'" />
      <div class="board-side top row">
        <span v-for="i in letters" :key="i">{{ i }}</span>
      </div>
      <div class="board-side left col">
        <span v-for="i in numbers" :key="i">{{ i }}</span>
      </div>
      <div class="board-chess">
        <board-view :model="model.board" />
      </div>
      <div class="board-side right col">
        <span v-for="i in numbers" :key="i">{{ i }}</span>
      </div>
      <div class="board-side bottom row">
        <span v-for="i in letters" :key="i">{{ i }}</span>
      </div>
      <div class="board-border"></div>
      <picker-view class="pick-black" :model="model.picker" :color="'black'" />
      <removed-figures-view class="removed-white" :model="model.removedWhite" />
      <removed-figures-view class="removed-black" :model="model.removedBlack" />
      <!-- <div class="grid-item" v-for="i in 18" :key="i"></div> -->
    </div>
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

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-inline: min(7vw, 7vh);
  border-bottom: 2px solid rgb(var(--border));
}

.grid {
  --base: min(7vw, 7vh);
  width: calc(var(--base) * 11);
  height: calc(var(--base) * 11);
  position: relative;
  display: grid;
  grid-template-columns: 2fr 1fr 4fr 8fr 4fr 1fr 2fr;
  grid-template-rows: 2fr 1fr 8fr 8fr 1fr 2fr;
}

.grid-item {
  border: 1px solid darkred;
}

.board-border {
  grid-column-start: 2;
  grid-column-end: -2;
  grid-row-start: 2;
  grid-row-end: -2;
  border: 2px solid rgb(var(--border));
}

.board-side {
  background-color: rgb(var(--surface));
  &.left {
    grid-column-start: 2;
  }
  &.right {
    grid-column-start: 6;
  }
  &.left, &.right {
    grid-row-start: 3;
    grid-row-end: 5;
  }
  &.top {
    grid-row-start: 2;
  }
  &.bottom {
    grid-row-start: 5;
  }
  &.top, &.bottom {
    grid-column-start: 2;
    grid-column-end: -2;
    padding-inline: calc(var(--base) / 2);
  }
}

.board-chess {
  position: relative;
  grid-column-start: 3;
  grid-column-end: -3;
  grid-row-start: 3;
  grid-row-end: 5;
}

.removed-white {
  position: relative;
  grid-column-start: 1;
  grid-row-start: 4;
}

.removed-black {
  position: relative;
  grid-column-start: -2;
  grid-row-start: 3;
}

.pick-white {
  position: relative;
  grid-column-start: 4;
  grid-row-start: 1;
}

.pick-black {
  position: relative;
  grid-column-start: 4;
  grid-row-start: 6;
}

$width: 400px;
$height: 150px;
dialog.figure-selector-dialog {
  left: calc((100% - $width) / 2);
  top: 2em;
  width: $width;
  height: $height;
}

.dlg-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1em;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-large);
  border: 1px solid rgb(var(--border));
  background-color: rgb(var(--surface));
  box-shadow: var(--shadow-large);
  overflow: hidden;
}

.dlg-content {
  position: relative;
  flex: 1 1 auto;
  pointer-events: auto;
  overflow: hidden;
}

.slow-enter-from,
.slow-leave-to {
  opacity: 0;
}
.slow-enter-active,
.slow-leave-active {
  transition: opacity var(--slow);
}

.fast-enter-from,
.fast-leave-to {
  opacity: 0;
}
.fast-enter-active,
.fast-leave-active {
  transition: opacity var(--fast);
}

.delayed-enter-from,
.delayed-leave-to {
  opacity: 0;
}
.delayed-enter-active {
  transition: opacity var(--fast) calc(var(--slow) - var(--fast));
}
.delayed-leave-active {
  transition: opacity var(--fast);
}
</style>
