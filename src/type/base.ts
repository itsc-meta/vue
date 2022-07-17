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

/**
 * 模型
 */
export interface IModel {
  name: string,
  url: string,
  x: number,
  y: number,
  z: number,
  degree?: number
}

/**
 * 配置
 */
export interface IConfig {
  bg: IModel,
  boothes: IModel[]
}