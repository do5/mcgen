export interface InfoTemplate {
  id: string;
  ext: string;
  addname: string;
  creatematch: string;
  description: string;
  vars: {
    name: string;
    description: string;
    value: any
  }[];
}

export interface Attr {
  id: string,
  [key: string]: string | string[]
}

export interface ModelInfo {
  //Fill after load
  //full path to the file
  $src: string,
  //namespace
  $namespace: string,
  //filename without ext
  $filename: string,
  //path without filename
  $path: string,


  imports: {
    file: string,
    type: string,
  }[];
  consts: {
    name: string,
    description: string,
    items: {
      name: string,
      description: string,
      type: string,
      value: Object
    }[]
  }[],
  enums: {
    name: string,
    description: string,
    items: {
      name: string,
      description: string,
      value: number
    }[]
  }[],
  models: {
    name: string,
    basetype: string,
    description: string,
    attrs: Attr[];
    items: {
      name: string,
      type: string,
      description: string
    }[]
  }[],
  contracts: {
    name: string,
    basetype: string,
    description: string,
    methods: {
      name: string,
      description: string,
      result: {
        type: string,
        description: string
      },
      args: {
        name: string,
        description: string,
        type: string,
        array: boolean,
        arrayparams: boolean
      }[]
    }[]
  }[]
}

export interface ImportType {
  type: string,
  namespace?: string,
}

export interface ConfigInfo {
  external: {
    type: string;
    langs: {
      [id: string]: {
        type: string,
        namespace?: string,
      }
    }[]
  }[],
  vars: {
    [key: string]: { [def: string]: any; }
  }
}
