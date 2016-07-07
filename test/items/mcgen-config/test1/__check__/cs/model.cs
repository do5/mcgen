using System;
using Task = System.Task;
using ExType = Sys.Data.ExType;

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
    public virtual Task prop1 {get; set; }
    /// <summary>
    /// Required. 
    /// </summary>
    public virtual ExType prop2 {get; set; }
  }


}
