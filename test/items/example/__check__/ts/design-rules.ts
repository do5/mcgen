import { User } from "./auth/auth-model";
import { BaseTypeExt } from "./auth/auth-model";

/**
 * ConstName description
 */
export namespace ConstName {
  export const valInteger: number= 12;
  export const valBoolean: boolean= true;
  export const valInteger64: number= 11111111111;
  /**
   * desc val1
   */
  export const valFloat: number= 24.34;
  /**
   * desc valString
   */
  export const valString: string= 'body-string';
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
   * returns boolean result desc
   */
  GetData(arg1: number, arg2: string): boolean;
}
export interface MyContractExt extends BaseTypeExt  {
}
