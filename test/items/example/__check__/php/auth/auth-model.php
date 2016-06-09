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
