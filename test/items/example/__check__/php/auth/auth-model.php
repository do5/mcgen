<?php
/*
* Generate info - version php: 7
*/
namespace Example\Auth;

/**
 * User model base
 * @property string $UserName 
 * @property bool $Psw ads
 */
interface UserBaseInterface
{
  const PN_UserName = 'UserName';
  const PN_Psw = 'Psw';

}

class UserBase implements UserBaseInterface
{
  public function __get($key)
  {
      return $this->$key;
  }

  public function __set($key, $value)
  {
      $this->$key = $value;
  }
}

/**
 * User model
 * @property string $EMail 
 */
interface UserInterface extends UserBaseInterface 
{
  const PN_EMail = 'EMail';

}

class User implements UserInterface
{
  public function __get($key)
  {
      return $this->$key;
  }

  public function __set($key, $value)
  {
      $this->$key = $value;
  }
}

interface BaseTypeExt
{
  /**
   * desc GetDataBaseExt
   *
   * @return int result desc
   */
  function GetDataBaseExt(): int;
}
