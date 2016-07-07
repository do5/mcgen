<?php
/*
* Generate info - version php: 7
*/
namespace Test1;

use System\Data\Tets\PromisePhp;
use System\Data\Tets\PromisePhp2;
/**
 * 
 * @property string $prop0 
 * @property PromisePhp $prop1 
 * @property ExType $prop2 
 * @property ExType2 $prop3 
 * @property PromisePhp2 $prop4 
 */
interface MandorInterface
{
  const PN_prop0 = 'prop0';
  const PN_prop1 = 'prop1';
  const PN_prop2 = 'prop2';
  const PN_prop3 = 'prop3';
  const PN_prop4 = 'prop4';

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

