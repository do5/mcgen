/**
 * User model base
*/
export class UserBase {
  /**
   * Required. 
   */
  UserName: string;
  /**
   * Required. ads
   */
  Psw: boolean;
}
/**
 * User model
*/
export class User extends UserBase {
  /**
   * Required. 
   */
  EMail: string;
}
export interface BaseTypeExt {
  /**
   * desc GetDataBaseExt
   * returns integer result desc
   */
  GetDataBaseExt(): number;
}
