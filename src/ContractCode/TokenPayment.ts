export const TokenPayment = `
scilla_version 0
import ListUtils IntUtils PairUtils
library TokenPayment

type Error =
| AdminValidationFailed
| StagingAdminNotExist
| StagingAdminValidationFailed
| WrongTokenImplementationAddress

let make_error =
fun (result: Error) =>
let result_code =
match result with
| AdminValidationFailed => Int32 -1
| StagingAdminNotExist => Int32 -2
| StagingAdminValidationFailed => Int32 -3
| WrongTokenImplementationAddress => Int32 -4
end
in
{ _exception: "Error"; code: result_code }

let zero = Uint128 0
let transfer_tag = "Transfer"

let one_msg =
fun (m : Message) =>
let e = Nil {Message} in
Cons {Message} m e

let create_transfer_messages: ByStr20 -> List ByStr20 -> List Uint128 -> List Message = 
    fun(current_impl: ByStr20) =>
	fun(addresses: List ByStr20) => 
	fun(amounts: List Uint128) =>
        let nil = Nil {Message} in
		let zip = @list_zip ByStr20 Uint128 in
    let zipped = zip addresses amounts in
    let foldleft = @list_foldl (Pair ByStr20 Uint128) (List Message) in
    let f = @fst ByStr20 Uint128 in 
    let s = @snd ByStr20 Uint128 in 
    let insert = 
      fun(tail: List Message) => 
      fun(address_amount_pair: Pair ByStr20 Uint128) => 
        let address = f address_amount_pair in 
        let amt = s address_amount_pair in 
        let head = {_tag: transfer_tag; _recipient: current_impl; _amount: zero; to: address; amount: amt} in
        Cons {Message} head tail
		in foldleft insert nil zipped

contract TokenPayment(
    init_admin: ByStr20,
    current_impl: ByStr20
)
(* Current contract admin *)
field contractadmin: ByStr20  = init_admin
(* Admin that can be claimed by existing address *)
field stagingcontractadmin: Option ByStr20 = None {ByStr20}

procedure ThrowError(err: Error)
    e = make_error err;
    throw e
end
procedure IsAdmin(initiator: ByStr20)
    contractadmin_tmp <- contractadmin;
    is_admin = builtin eq initiator contractadmin_tmp;
    match is_admin with
    | True  =>
    | False =>
        e = AdminValidationFailed;
        ThrowError e
    end
end
(* Update staged admin *)
transition UpdateAdmin(admin: ByStr20)
    IsAdmin _sender;
    staging_admin = Some {ByStr20} admin;
    stagingcontractadmin := staging_admin
end
(* Staged admin can claim the staged admin and become admin *)
transition ClaimAdmin()
    staging_admin <- stagingcontractadmin;
    match staging_admin with
    | Some admin =>
        is_valid = builtin eq _sender admin;
        match is_valid with
        | True =>
            contractadmin := admin;
            staging_admin = None {ByStr20};
            stagingcontractadmin := staging_admin;
            e = { _eventname: "ClaimAdmin"; new_admin: admin };
            event e
        | False =>
            e = StagingAdminValidationFailed;
            ThrowError e
        end
    | None =>
        e = StagingAdminNotExist;
        ThrowError e
    end
end
(* get back remaining zrc2 tokens *)
transition DrainContractBalance(amt: Uint128)
    IsAdmin _sender;
    msg = {_tag: transfer_tag; _recipient: current_impl; _amount: zero; to: _sender; amount: amt};
    msgs = one_msg msg;
    send msgs;
    e = { _eventname: "DrainContractBalance"; to: _sender; amount: amt};
    event e
end
(* dummy to be able to send the tokens back to admin *)
transition TransferSuccessCallBack(sender: ByStr20, recipient: ByStr20, amount: Uint128)
end
(* accepts tokens from implementation *)
transition RecipientAcceptTransfer(sender: ByStr20, recipient: ByStr20, amount: Uint128)
    is_right_implementation = builtin eq _sender current_impl;
    match is_right_implementation with
    | True  =>
    | False =>
        e = WrongTokenImplementationAddress;
        ThrowError e
    end
end
(* send payments to zrc2 compatible *)
transition Pay(addresses: List ByStr20, amts: List Uint128)
    IsAdmin _sender;
    msgs = create_transfer_messages current_impl addresses amts;
    send msgs;
    e = { _eventname: "Pay"; addresses: addresses; amts: amts};
    event e
end 
`;
