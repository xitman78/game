<script setup lang="ts">
import { type ChessGame } from './chess-game';

const { model } = defineProps<{ model: ChessGame }>();

function escape(e: KeyboardEvent) {
  if (e.code === 'Escape') {
    model.ok();
  }
}
</script>

<template>
  <div class="flex col gap-4">
    <teleport to="body">
      <ui-dialog :model="model.dialog" class="win-dialog" @keydown="escape">
        <div class="dlg-panel">
          <h2>{{ model.chess.turn }} win!</h2>
          <ui-button class="btn" @click="model.ok()">ok</ui-button>
        </div>
      </ui-dialog>
    </teleport>
    <teleport to="body">
      <ui-dialog :model="model.themeDialog" class="theme-dialog">
        <div class="dlg-panel m-4">
          <theme-view :model="model.theme" />
        </div>
      </ui-dialog>
    </teleport>
    <div class="chess-header">
      <h2>{{ model.chess.turn }} turn</h2>
      <div class="spacer"></div>
      <ui-button class="btn" @click="model.reset()">reset</ui-button>
      <ui-button class="btn" v-model="model.showTheme" toggle>
        <ui-icon class="gear-solid" />
      </ui-button>
    </div>
    <div class="chess-wrapper" :style="model.theme.style">
      <board-view :model="model.board" />
    </div>
  </div>
</template>

<style lang="scss">
.chess-header {
  display: flex;
  gap: 0.5em;
  align-items: center;
  border-bottom: 2px solid rgb(var(--border));
}

.chess-wrapper {
  --base: min(8vw, 8vh);
  width: calc(var(--base) * 9);
  height: calc(var(--base) * 10);
  position: relative;
}

$width: 400px;
$height: 150px;
dialog.win-dialog {
  left: calc((100% - $width) / 2);
  top: 2em;
  width: $width;
  height: $height;
}
</style>
