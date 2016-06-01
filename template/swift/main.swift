
import Foundation

//инрерфейсы
public protocol MyInterface {
  var property: String {get set};
  func Do();
  func GetString(name: String) -> String;
}

//константы
let const1 = 0;
let const2 = 1;

public class ConstClass {
  public let const1 = 5;
  internal let const2 = 6;
  private let const3 = 7;
}
//перечисления
enum Rank: Int {
  case Ace = 1
  case Two = 3
  case Three = 8
}
//классы
public class A {
  public var X: Int;
  public var Y: Double;
  init(){
    self.X = 0;
    self.Y = 1.1;
  }
  public func Sum(a: Int, b: Int) -> Int{
    return a + b;
  }
}

public class B: A, MyInterface{
  
  override init() {
    self.property = "default";
    super.init();
  }
  
  public var property: String;
  public func Do() {
    
  }
  public func GetString(name: String) -> String{
    return "Hello " + name;
  }
  
}


func main(){
  let b = B();
  print(b.GetString("AAA"));
}

main();



