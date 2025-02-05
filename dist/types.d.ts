export declare namespace Types {
    type Bits = "32" | "64" | "128" | "256";
    type ByStrLength = "20" | "30" | "";
    export type String = "String";
    export type Bool = "Bool";
    export type BNum = "BNum";
    export type Int<X extends Bits> = `Int${X}`;
    export type Uint<X extends Bits> = `Uint${X}`;
    export type ByStr<X extends ByStrLength> = `ByStr${X}`;
    export type Primitive = Int<Bits> | Uint<Bits> | ByStr<ByStrLength> | String | BNum;
    export type Algebraic = Bool | ScillaList<any> | ScillaMap<any, any> | Pair<any, any>;
    export type ScillaList<V extends All> = `List (${V})`;
    export type ScillaMap<K extends Primitive, V extends All> = `Map (${K}) (${V})`;
    export type Pair<V1 extends All, V2 extends All> = `Pair (${V1}) (${V2})`;
    export type All = Primitive | Algebraic;
    export {};
}
