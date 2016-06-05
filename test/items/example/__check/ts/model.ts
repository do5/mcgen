


/**
* desc val
**/
export public const Integer: numeric= 23
/**
* desc val1
**/
export public const Number: numeric= 24.34
/**
* desc val1
**/
export public const String: string= '-+string'
/**
* desc val1
**/
export public const Boolean: boolean= true

/**
* desc
**/
export enum Enum
{
   /**
   * desc val
   **/
  Val = 23,
  Val2
}

export interface MyTypeNext
{
   /**
   * Optional. prop2 desc
   **/
  prop2: boolean;
   /**
   * Required.
   **/
  prop3: MyType;
}


export interface MyContract extends MyType
{
   /**
   * desc getData
   * @param  { numeric } arg1 arg1 desc
   * @param  { string } arg2 arg2 desc
   * returns MyType result desc
   **/
  getData(arg1: numeric, arg2: string): MyType;
}
