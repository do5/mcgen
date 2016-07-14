using System;

namespace PnModel
{
  public partial class PN_Mandor
  {
    /// <summary>
    /// 
    /// </summary>
    public const string ThisName = "Mandor";
    /// <summary>
    /// Required. 
    /// </summary>
    public const string prop0 = "prop0";
    /// <summary>
    /// Required. 
    /// </summary>
    public const string prop1 = "prop1";
  }

  public partial class Mandor
  {
    /// <summary>
    /// Required. 
    /// </summary>
    public virtual string prop0 {get; set; }
    /// <summary>
    /// Required. 
    /// </summary>
    public virtual int prop1 {get; set; }
  }


}
