<template>
  <div class="loading" />
</template>

<style lang="scss" scoped>
.loading {
  position: absolute;
  width: 100%;
  height: 100%;
}
.loading::after {
  position: absolute;
  content: '';
  top: 50%;
  left: 50%;
  width: 30px;
  margin-left: -15px;
  height: 30px;
  margin-top: -15px;
  border: 2px solid rgba(255, 255, 255, 0.7);
  border-top-color: transparent;
  border-radius: 100%;
  animation: circle infinite 0.75s linear;
}
@keyframes circle {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
