


/**
 * User model base
*/
export interface UserBase {
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
export interface User extends UserBase {
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
