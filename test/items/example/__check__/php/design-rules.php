<?php
/*
* Generate info - version php: 7
*/
namespace Example;

use Example\Auth\UserInterface;
use Example\Auth\BaseTypeExt;
/**
 * ConstName description
 */
interface ConstName
{
  const valInteger = 12;
  const valBoolean = true;
  const valInteger64 = 11111111111;
  /**
   * desc val1
   */
  const valFloat = 24.34;
  /**
   * desc valString
   */
  const valString = 'body-string';
}

interface OnOff
{
  /**
   * @var int desc On value
   */
  const On = 1;
  /**
   * @var int desc Off value
   */
  const Off = 0;
}

/**
 * 
 * @property string $Address 
 * @property int $UsedEnum (optional) Use interface OnOff. 
 * @property bool $Point 
 */
interface UserInfoInterface extends UserInterface 
{
}

class UserInfo implements UserInfoInterface
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

interface BaseType
{
  /**
   * desc GetDataBase
   *
   * @return int result desc
   */
  function GetDataBase(): int;
}
interface MyContract extends BaseType 
{
  /**
   * desc getData
   *
   * @param int $arg1 arg1 desc
   * @param string $arg2 arg2 desc
   * @return bool result desc
   */
  function GetData(int $arg1, string $arg2): bool;
}
interface MyContractExt extends BaseTypeExt 
{
}
