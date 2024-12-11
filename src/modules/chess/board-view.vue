<script setup lang="ts">
import {type Board} from './board';

const { model } = defineProps<{ model: Board}>();
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

// figures
// .white {
//   stroke: darkred;
//   stroke-width: 0.2;
//   stroke-linecap: round;
//   stroke-linejoin: round;
// }
$blur: 0.3px;
.black {
  fill: black;
  filter: drop-shadow(0 0 $blur white);
}
.white {
  fill: white;
  filter: drop-shadow(0 0 $blur black);
}

$pawn: (
  M 2,1 C 2,2 2,2 3,2 L 3.25,4 C 2.5,4 2.5,4 2.5,4.25 C 2.5,4.5 2.5,4.5 3.25,4.5
  C 3,6 3,6 4,6 C 5,6 5,6 4.75,4.5 C 5.5,4.5 5.5,4.5 5.5,4.25 C 5.5,4 5.5,4 4.75,4
  L 5,2 C 6,2 6,2 6,1 z
);

$rook: (
  M 1.5,1 c 0,1 0,1 1,1 L 3.25,5 C 2,5 2,5 2,7
  h 0.75 v -0.5 h 0.75 v 0.5 h 1 v -0.5 h 0.75 v 0.5 h 0.75
  C 6,5 6,5 4.75,5 L 5.5,2 c 1,0 1,0 1,-1 z
);

$knight: (
  M 1.5,1 c 0,1 0,1 1,1 c 0,1 0,1 1,2 c 0.5,1 0.5,1 -1,0.5 c -1,0 -1,0 -1,1
  L 6,7 l -0.25,-1 c 1,-1 -0.5,-2 -0.25,-4 c 1,0 1,0 1,-1
  z
);

$bishop: (
  M 1.5,1 c 0,1 0,1 1,1 L 3.25,3 C 2.25,3 2.25,5 4,7 C 5.75,5 5.75,3 4.75,3
  L 5.5,2 c 1,0 1,0 1,-1
  z
);

$queen: (
  M 1.5,1 c 0,1 0,1 1,1 L 1.5,6 3,5 4,7 5,5 6.5,6 5.5,2 c 1,0 1,0 1,-1
  z
);

$king: (
  M 1.5,1 c 0,1 0,1 1,1 C 1,4 1,6.5 3.75,5.75
  v 0.5 h -0.5 v 0.5 h 0.5 v 0.5 h 0.5 v -0.5 h 0.5 v -0.5 h -0.5 v -0.5
  C 7,6.5 7,4 5.5,2 c 1,0 1,0 1,-1
  z
);

.pawn { d: path("#{$pawn}"); }
.rook { d: path("#{$rook}"); }
.knight { d: path("#{$knight}"); }
.bishop { d: path("#{$bishop}"); }
.queen { d: path("#{$queen}"); }
.king { d: path("#{$king}"); }
</style>
