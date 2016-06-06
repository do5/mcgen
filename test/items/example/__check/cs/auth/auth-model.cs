using System;

namespace Example.Auth
{


  /// <summary>
  /// User model base
  /// </summary>
  public partial class UserBase
  {
    /// <summary>
    /// Required. 
    /// </summary>
    public virtual string UserName {get; set; }
    /// <summary>
    /// Required. ads
    /// </summary>
    public virtual bool Psw {get; set; }
  }
  /// <summary>
  /// User model
  /// </summary>
  public partial class User : UserBase 
  {
    /// <summary>
    /// Optional. 
    /// </summary>
    public virtual string EMail {get; set; }
  }


}
