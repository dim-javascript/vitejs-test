<!--
 * @Author: 政务业务部-杜敏 dumin@daqsoft.com
 * @Description: 适用于表单搜索以及提交组件，若当前组件的某一个不能满足某一个组件时，请使用插槽的形式。
-->
<template>
  <div
    v-if="formData.length > 0"
    class="daq-form-item"
    :style="{ width: formWidth }"
  >
    <el-form
      ref="formDataRef"
      :model="formData"
      v-bind="globalFormAttr"
      class="custom-form-cls"
    >
      <el-row v-bind="globalRowAttr">
        <el-col
          v-for="(item, index) in formData"
          :key="index"
          :span="item.span || globalSpan"
          v-bind="item.colAttr || null"
        >
          <el-form-item
            :label="item.label"
            :prop="item.name"
            v-bind="item.formItemAttr"
          >
            <template v-if="$slots[item.name]">
              <slot :name="item.name"></slot>
            </template>

            <template v-else>
              <component
                :is="item.type || 'el-input'"
                v-model="item[item.name]"
                v-bind="setInputAttrHandle(item)"
                :maxlength="item?.inputAttr?.maxlength || 26"
                :clearable="item?.inputAttr?.clearable || globalClearable"
              >
                <!-- 适用于 el-select -->
                <template v-if="item.type === 'el-select'">
                  <el-option
                    v-for="(val, idx) in item.options"
                    :key="idx"
                    :label="val[item.inputAttr?.selectLabel ?? 'label']"
                    :value="val[item.inputAttr?.selectValue ?? 'value']"
                  ></el-option>
                </template>

                <!-- 适用于 el-radio-group -->
                <template v-if="item.type === 'el-radio-group'">
                  <el-radio
                    v-for="(val, idx) in item.radios"
                    :key="idx"
                    :label="val[item.inputAttr?.radioLabel ?? 'label']"
                  >
                    {{ val[item.inputAttr?.radioValue ?? 'value'] }}
                  </el-radio>
                </template>
              </component>
              <template v-if="item.rich?.text">
                <div
                  class="rich-text-wrap"
                  :style="{ '--rich-right': item.rich?.right }"
                >
                  {{ item.rich.text }}
                </div>
              </template>
            </template>
          </el-form-item>
        </el-col>

        <template v-if="!$slots['custom-btn'] && showDefaultBtn">
          <el-form-item
            v-if="operaBtnList.length > 0"
            :label-width="globalBtnLabelWidth"
            class="form-btn-group-cls"
          >
            <el-button
              v-for="(btnItem, index) in operaBtnList"
              :key="index"
              v-bind="btnItem.btnAttr"
              @click="operationHandle(btnItem.type)"
            >
              {{ btnItem.text }}
            </el-button>
          </el-form-item>
        </template>
      </el-row>
    </el-form>

    <template v-if="$slots['custom-btn']">
      <slot name="custom-btn" :handle="operationHandle"> </slot>
    </template>
  </div>
</template>

<script setup>
import { reactive, computed, watchEffect, ref } from 'vue';

const props = defineProps({
  // 表单的宽度，可以是具体的像素 px 也可以是 %。
  formWidth: {
    type: String,
    default: '100%',
  },

  // form 表单的属性，与 element-plus 的 form 表单属性一致
  formAttr: {
    type: Object,
    default: () => ({}),
  },

  // 与 element-plus 中的布局组件中的 row 属性完全一致
  globalRowAttr: {
    type: Object,
    default: () => ({
      gutter: 20,
      type: 'flex',
    }),
  },

  // 设置每个表单组件的 span 【全局设置，若需要单个单独设置，请在每项单独设置 span 属性】
  globalSpan: {
    type: Number,
    default: 5,
  },

  // 是否在表单的组件中显示清楚按钮【全局设置】
  globalClearable: {
    type: Boolean,
    default: true,
  },

  // 全局设置按钮属性 label-width，若使用了按钮自定义插槽，则此属性不生效
  globalBtnLabelWidth: {
    type: String,
    default: '20px',
  },

  /**
   * 对功能按钮的设置
   *
   * operaType: 区分对功能列表的类型进行区分，add [新增]，reset [重置]
   * * 新增表示在默认的按钮列表 [ defaultBtnList ] 上新增,
   *
   * list 里面的属性，详情请看 defaultBtnList 变量的参数
   * * * text: 按钮的名称
   * * * type: 点击按钮时的类型，用于向组件外传递的事件进行区分
   * * * btnAttr: 用于 el-button 中的属性设置；属性值与 el-button 的属性一致
   */
  btnListAttr: {
    type: Object,
    default: () => ({
      operaType: '',
      list: [],
    }),
  },

  // 是否显示默认按钮 【保存按钮，重置按钮】
  showDefaultBtn: {
    type: Boolean,
    default: true,
  },

  /**
   * 列表的个数，以及数据格式
   *
   *
   * 每一项的数据说明
   * name:: 当前使用的名称
   * label: 当前的 label
   * formItemAttr: 表单的属性
   * inputAttr: 当前表单中的组件属性，设置的 type 组件的属性。与当前组件的 element-ui 属性一致；
   *            当为 el-select 时，其中的新增的 selectLabel、selectValue 改变映射的 label 和 value 值；
   * type: 当前使用的表单组件的类型，目前只适用于
   *       el-input（默认），el-select，el-date-picker 等表单属性的组件
   *       注意 el-select 和 el-radio-group 组件的使用，页面对其进行了封装，使用时详细查看源代码
   * defaultVal: [当前项有问题] 默认值，当使用插槽时报错时，便于判断值不为空，请将此值设为不为 空 的任意值；
   *             如果要使用重置功能，并且当前的组件的默认值 不为 基础类型 值时，便于重置操作，请设置默认值。
   * span: 当前项的宽度以及尺寸，与布局中的 span 属性一致。
   *
   * rich: 简单的文本标注属性
   *    text: 表示输入框后对该文本的标注，比如：㎡
   *    right: 离输入框左边的距离，为 px 负数，默认为 -20px
   * 插槽的使用: 当 type 不能满足时，请使用插槽的形式，插槽的名称为当前设置的 name 属性。
   */
  formList: {
    type: Array,
    default: () => [],
    required: true,
  },
});

const formData = computed(() => {
  props.formList.forEach((item) => (item[item.name] = item[item.name] || ''));
  return props.formList;
});

// 动态的赋默认值
// watchEffect(() => {
//   if (props.formList.length > 0) {
//     props.formList.forEach(item => {
//       item.defaultVal !== undefined && (formData[item.name] = item.defaultVal || '');
//     });
//   }
// });

// 全局的 form 表单属性进行整合
const globalFormAttr = computed(() => {
  const defaultFormAttr = {
    // size: 'small',
    labelWidth: '80px',
  };

  return {
    ...defaultFormAttr,
    ...props.formAttr,
  };
});

const emit = defineEmits(['update:formList', 'submit-handle']);

watchEffect(() => {
  console.log('formData', formData.value);
  // emit('update:formList', formData.value);
});

// 设置默认的按钮功能列表 [若使用了按钮自定义插槽，则此属性不生效]
const operaBtnList = computed(() => {
  /**
   * 默认的按钮的功能列表
   *
   * text: 按钮的名称
   * type: 点击按钮时的类型，用于向组件外传递的事件进行区分
   * btnAttr: 用于 el-button 中的属性设置；属性值与 el-button 的属性一致
   */
  const defaultBtnList = [
    {
      text: '查询',
      type: 'search',
      btnAttr: {
        type: 'primary',
        class: 'custom-btn-cls',
      },
    },
    {
      text: '重置',
      type: 'reset',
    },
  ];

  if (props.btnListAttr.operaType === 'add') {
    return [...defaultBtnList, ...props.btnListAttr.list];
  } else if (props.btnListAttr.operaType === 'reset') {
    return [...props.btnListAttr.list];
  } else {
    return [...defaultBtnList];
  }
});

// 表单事例
const formDataRef = ref(null);

/**
 * @description: 按钮操作函数, 为了便于在插槽中使用，单独调用该方法，则修改成 promise 形式
 * @param { string } btnType 当前按钮类型。
 */
// eslint-disable-next-line no-empty-function
function operationHandle(btnType) {
  // console.log('btnType', btnType);
  return new Promise((resolve, reject) => {
    if (btnType === 'reset') {
      formDataRef.value.resetFields();

      // 在书写自定义事件时，当前的名称与使用时的名称保持一致。
      emit('submit-handle', btnType);

      resolve(formData);
    } else {
      console.log('formData', props.formList);
      formDataRef.value.validate((valid) => {
        if (valid) {
          // 自定义函数的两个参数，第一个为查询的数据，第二为按钮的 type 类型
          emit('submit-handle', btnType);

          resolve();
        } else {
          // console.error('验证失败');
          reject('验证失败');
        }
      });
    }
  });
}

/**
 * @description: 设置 type 默认情况下的属性
 * @param {object} curItem 当前表单的组件项
 * @return {object} 返回当前设置的表单属性
 */
function setInputAttrHandle(curItem) {
  return curItem.type
    ? curItem.inputAttr
    : { placeholder: '请输入', ...curItem.inputAttr };
}

// 向外暴露出的属性
defineExpose({
  operationHandle,
  formDataRef,
  // formData
});
</script>

<style lang="scss" scoped>
.rich-text-wrap {
  position: absolute;
  top: 0;
  right: var(--rich-right, -20px);
  font-size: var(--font-size-s14);
  color: var(--el-color-info);
}
</style>
