import { User } from "./auth/auth-model";
import { BaseTypeExt } from "./auth/auth-model";
/**
 * ConstName description
 */
export namespace ConstName {
  export const valInteger = 12;
  export const valBoolean = true;
  export const valInteger64 = 11111111111;
  /**
   * desc val1
   */
  export const valFloat = 24.34;
  /**
   * desc valString
   */
  export const valString = 'body-string';
}
export enum OnOff {
  /**
   * desc On value
   */
  On = 1,
  /**
   * desc Off value
   */
  Off
}
export interface UserInfo extends User {
  /**
   * Required. 
   */
  Address: string;
  /**
   * Optional. 
   */
  UsedEnum?: OnOff;
  /**
   * Required. 
   */
  Point: boolean;
  /**
   * Required. 
   */
  AnyVal: any[];
}
export interface BaseType {
  /**
   * desc GetDataBase
   * returns integer result desc
   */
  GetDataBase(): number;
}
export interface MyContract extends BaseType  {
  /**
   * desc getData
   * @param  { number } arg1 arg1 desc
   * @param  { string } arg2 arg2 desc
   * @param  { string[] } arg3arr arg3arr desc
   * returns boolean result desc
   */
  GetData(arg1: number, arg2: string, arg3arr: string[]): boolean;
  /**
   * desc getDataArr
   * @param  { number[] } arg1arr arg1 desc
   * @param  { string[] } arg2arr arg3arr desc
   * @param  { ...string[] } arg3arr arg4arr desc
   * returns UserInfo[] result desc
   */
  GetDataArr(arg1arr: number[], arg2arr: string[], ...arg3arr: string[]): UserInfo[];
}
export interface MyContractExt extends BaseTypeExt  {
}
