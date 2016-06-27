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
 * @property mixed[] $AnyVal 
 */
interface UserInfoInterface extends UserInterface 
{
  const PN_Address = 'Address';
  const PN_UsedEnum = 'UsedEnum';
  const PN_Point = 'Point';
  const PN_AnyVal = 'AnyVal';

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
   * @param string[] $arg3arr arg3arr desc
   * @return bool result desc
   */
  function GetData(int $arg1, string $arg2, array $arg3arr): bool;
  /**
   * desc getDataArr
   *
   * @param int[] $arg1arr arg1 desc
   * @param string[] $arg2arr arg3arr desc
   * @return UserInfo[] result desc
   */
  function GetDataArr(array $arg1arr, array $arg2arr): array;
}
interface MyContractExt extends BaseTypeExt 
{
}
