<template>
  <div class="platform">
    <loading-surface v-if="isLoading" class="msg">{{loadingMsg}}</loading-surface>
    <canvas ref="canvas" width="500" height="500" style="width:100%" @click="onCast"></canvas>
    <div v-if="!isLoading" class="dialog">
      <section class="dialog-content" :class="{fold}">
        <header>
          <h2>{{boothInfo.name}}</h2>
          <div class="fold-btn" @click.stop="toggle">
            <img v-if="fold" src="@/assets/images/unfold.png" />
            <img v-else src="@/assets/images/fold.png" />
          </div>
        </header>
        <article>
          <p>{{boothInfo.content}}</p>
        </article>
        <footer v-if="boothInfo.site || boothInfo.zoom">
          <a v-if="boothInfo.site" :href="boothInfo.site" target="_blank"><img class="operation" src="@/assets/images/website.png" /></a>
          <a v-if="boothInfo.zoom" :href="boothInfo.zoom" target="_blank"><img class="operation" src="@/assets/images/zoom.png" /></a>
        </footer>
      </section>
      <div class="dialog-secretary">
        <img src="@/assets/images/secretary.png" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import LoadingSurface from '@/components/loading-surface.vue';
import { usePlatform } from '@/store';
import { computed, onMounted, ref, watch } from 'vue';
const props = defineProps({
  id: String
});
const store = usePlatform();
const canvas = ref<HTMLCanvasElement>();
function onCast(e:MouseEvent) {
  const x = ( e.clientX / window.innerWidth ) * 2 - 1;
	const y = - ( e.clientY / window.innerHeight ) * 2 + 1;
  store.cast(x, y);
}
const isLoading = computed(() => store.isLoading);
const loadingMsg = computed(() => store.loadingMsg);
const boothInfo = computed(() => store.boothInfo);
const fold = computed(() => store.isFold);

function toggle() {
  store.toggleFold();
}

onMounted(() => {
  if(canvas.value) {
    store.freight(canvas.value); // 装载canvas
    store.start(props.id||''); // 按照config开始执行
  }
});
watch(() => props.id, (val, old) => {
  store.start(val||''); // config修改
});
</script>
