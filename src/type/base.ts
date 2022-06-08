/**
 * 模型状态枚举
 */
export enum MODEL_STATUS {
  none, // 空状态
  error, // 错误状态
  loading, // 读取中
  ready, // 普通状态
  executing // 执行中
}