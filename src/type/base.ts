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
  name: string, // 名称
  content: string, // 内容
  url: string, // 模型地址
  image?: string, // 图片
  site?: string, // 官网
  zoom?: string, // zoom
  x: number, // 坐标
  y: number,
  z: number,
  degree?: number // 角度
}

/**
 * 配置
 */
export interface IConfig {
  bg: IModel, // 背景
  base: IModel, // 默认位置
  journals: { // 期刊
    url: string,
    list: IModel[]
  },
  boothes: IModel[] // 展位
}