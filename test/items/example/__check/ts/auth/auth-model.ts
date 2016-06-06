



/**
* User model base
**/
export interface UserBase
{
   /**
   * Required. 
   **/
  UserName: string;
   /**
   * Required. ads
   **/
  Psw: boolean;
}
/**
* User model
**/
export interface User extends UserBase 
{
   /**
   * Optional. 
   **/
  EMail: string;
}


