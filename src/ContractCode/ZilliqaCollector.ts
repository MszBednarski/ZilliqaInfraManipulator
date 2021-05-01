export const ZilliqaCollector = `
scilla_version 0
(* yoinked from https://viewblock.io/zilliqa/address/zil1k7qwsz2m3w595u29je0dvv4nka62c5wwrp8r8p?tab=code *)
import ListUtils IntUtils
library Collector

type Error =
| AdminValidationFailed
| StagingAdminNotExist
| StagingAdminValidationFailed

let make_error =
fun (result: Error) =>
let result_code =
match result with
| AdminValidationFailed => Int32 -3
| StagingAdminNotExist => Int32 -4
| StagingAdminValidationFailed => Int32 -5
end
in
{ _exception: "Error"; code: result_code }

let one_msg =
fun (m : Message) =>
let e = Nil {Message} in
Cons {Message} m e

let addfunds_tag = "AddFunds"

contract Collector(
    init_admin: ByStr20
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
procedure TransferFunds(tag: String, amt: Uint128, recipient: ByStr20)
    msg = {_tag: tag; _recipient: recipient; _amount: amt};
    msgs = one_msg msg;
    send msgs
end
(* Update staged admin *)
transition UpdateAdmin(admin: ByStr20, initiator: ByStr20)
    IsAdmin initiator;
    staging_admin = Some {ByStr20} admin;
    stagingcontractadmin := staging_admin
end
(* Staged admin can claim the staged admin and become admin *)
transition ClaimAdmin(initiator: ByStr20)
    staging_admin <- stagingcontractadmin;
    match staging_admin with
    | Some admin =>
        is_valid = builtin eq initiator admin;
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
(* add any amount of funds to the contract *)
transition AddFunds(initiator: ByStr20)
    accept;
    e = { _eventname : "Funds deposit "; funder : initiator };
    event e
end
(* withdraw funds from the contract *)
transition DrainContractBalance(amt: Uint128, initiator: ByStr20)
    IsAdmin initiator;
    bal <- _balance;
    less_than = builtin lt bal amt;
    match less_than with
    | True => throw
    | False =>
        TransferFunds addfunds_tag amt initiator
    end
end
`;
