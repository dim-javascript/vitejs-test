<script setup>
import { reactive, ref } from 'vue';
import Index from './components/index.vue';

const formList = reactive([
  {
    label: '申请人',
    name: 'applyPeople',
    type: 'el-select',
    options: [
      {
        label: '张大卷',
        value: '1',
      },
    ],
  },
  {
    label: '变更类型',
    name: 'changeType',
    type: 'el-select',
    options: [
      {
        label: '张大卷',
        value: '1',
      },
    ],
  },
]);

const formData = reactive({
  applyPeople: '1',
  changeType: '',
});

// 验证规则
const rules = reactive({
  applyPeople: [{ required: true, message: '申请人不能为空', trigger: 'blur' }],
  changeType: [
    { required: true, message: '变更类型不能为空', trigger: 'blur' },
  ],
});

function onHandle(type, data) {
  console.log('type', type);
  console.log('data', data);
}
</script>

<template>
  <Index
    :form-list="formList"
    :form-data="formData"
    :form-attr="{
      labelWidth: '160px',
      rules,
    }"
    :global-span="24"
    :global-row-attr="{
      class: 'daq-fl daq-fl-column',
    }"
    @submit-handle="onHandle"
  >
  </Index>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
