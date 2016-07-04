## 1.0.0-beta.21 (2016-04-08)

bugfix:
  - escape description

## 1.0.0-beta.20 (2016-04-08)

Features:
  - add type arrayparams in contract. Example typescript: `method(...ss:string[])`
  ```json
  "name": "PointArray",
  "array": true,
  **"arrayparams": true**
  "type": "boolean"
```

## 1.0.0-beta.19 (2016-02-08)

bugfix:
  - The error relative path

## 1.0.0-beta.18 (2016-02-07)

bugfix:
  - The error import parent path
  ```json
   "imports": [
   {
     "file": "../../../model",
     "type": "ProfileBack"
   }
  ```

## 1.0.0-beta.17 (2016-06-27)

add:
  - php. Names of the properties to generate interfaces
  ```php
   interface UserInterface
   {
     const PN_Address = 'Address';
     const PN_UsedEnum = 'UsedEnum';
     const PN_Point = 'Point';
     const PN_AnyVal = 'AnyVal';
   }
  ```  

## 1.0.0-beta.16 (2016-06-14)

bugfix:
  - error validating not point file  

## 1.0.0-beta.14 (2016-06-09)

Features:
  - add type any. ts:object,php:mixed,ts:any
  - add type array
  ```json
  "name": "PointArray",
  "array": "true",
  "type": "boolean"
```

## 1.0.0-beta.13 (2016-06-09)

Features:

  - add ignory __check__ for create project
  - add default value `required`   
     typescript `data?: string`
     cs `data?: string`
     php `only in comment`
  - watch - It decided to use onchange or other utilities 



## 1.0.0-beta.1 (2016-05-30)
**Add project to npm**
Bugfixes:
Security:
