using System;
using Action = System.Data.Tets.Action;

namespace Test1
{


  public partial class Mandor
  {
    /// <summary>
    /// Required. 
    /// </summary>
    public virtual string prop0 {get; set; }
    /// <summary>
    /// Required. 
    /// </summary>
    public virtual System.Action<Async> prop1 {get; set; }
    /// <summary>
    /// Required. 
    /// </summary>
    public virtual ExType prop2 {get; set; }
    /// <summary>
    /// Required. 
    /// </summary>
    public virtual ExType2 prop3 {get; set; }
    /// <summary>
    /// Required. 
    /// </summary>
    public virtual Action prop4 {get; set; }
  }


}
