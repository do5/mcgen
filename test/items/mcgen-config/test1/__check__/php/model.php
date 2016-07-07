<?php
/*
* Generate info - version php: 7
*/
namespace Test1;

use Sys\Data\Async;
use Sys\Data\ExType;


/**
 * 
 * @property string $prop0 
 * @property Async $prop1 
 * @property ExType $prop2 
 */
interface MandorInterface
{
  const PN_prop0 = 'prop0';
  const PN_prop1 = 'prop1';
  const PN_prop2 = 'prop2';

}

class Mandor implements MandorInterface
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

