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

export interface Atts {
  id: string,
  [key:string]: string|string[]
}

export interface ModelInfo {
  $src: string,
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
    attr: Attr[];
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
      result: string,
      args: {
        name: string,
        description: string,
        type: string,
      }[]
    }[]
  }[]
}
