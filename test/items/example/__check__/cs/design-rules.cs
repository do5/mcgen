using System;
using User = Example.Auth.User;
using BaseTypeExt = Example.Auth.BaseTypeExt;

namespace Example
{
  /// <summary>
  /// ConstName description
  /// </summary>
  public static class ConstName
  {
    public const int valInteger = 12;
    public const bool valBoolean = true;
    public const Int64 valInteger64 = 11111111111;
    /// <summary>
    /// desc val1
    /// </summary>
    public const double valFloat = 24.34;
    /// <summary>
    /// desc valString
    /// </summary>
    public const string valString = "body-string";
  }

  public enum OnOff
  {
    /// <summary>
    /// desc On value
    /// </summary>
    On = 1,
    /// <summary>
    /// desc Off value
    /// </summary>
    Off
  }

  public partial class UserInfo : User 
  {
    /// <summary>
    /// Optional. 
    /// </summary>
    public virtual string Address {get; set; }
    /// <summary>
    /// Optional. 
    /// </summary>
    public virtual OnOff UsedEnum {get; set; }
  }


  public partial interface BaseType
  {
    /// <summary>
    /// desc GetDataBase
    /// <returns>result desc</returns>
    /// </summary>
    int GetDataBase();
  }
  public partial interface MyContract : BaseType 
  {
    /// <summary>
    /// desc getData
    /// <param name="arg1">arg1 desc</param>
    /// <param name="arg2">arg2 desc</param>
    /// <returns>result desc</returns>
    /// </summary>
    bool GetData(int arg1, string arg2);
  }
  public partial interface MyContractExt : BaseTypeExt 
  {
  }
}
