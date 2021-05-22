export const ZilliqaICOContract = `
scilla_version 0
import ListUtils IntUtils PairUtils
library ICOContract

type Error =
| AdminValidationFailed
| StagingAdminNotExist
| StagingAdminValidationFailed
| WrongTokenImplementationAddress
| ICOHasEnded
| ICODidNotEndYet
| FundingGoalNotReached
| FundingGoalReached
| ThisIsNotTokenRecipient

let make_error =
fun (result: Error) =>
let result_code =
match result with
| AdminValidationFailed => Int32 -1
| StagingAdminNotExist => Int32 -2
| StagingAdminValidationFailed => Int32 -3
| WrongTokenImplementationAddress => Int32 -4
| ICOHasEnded => Int32 -5
| ICODidNotEndYet => Int32 -6
| FundingGoalNotReached => Int32 -7
| FundingGoalReached => Int32 -8
| ThisIsNotTokenRecipient => Int32 -9
end
in
{ _exception: "Error"; code: result_code }

let zero = Uint128 0
let one_msg =
fun (m : Message) =>
let e = Nil {Message} in
Cons {Message} m e

let transfer_tag = "Transfer"

let addfunds_tag = "AddFunds"

let uint128_le = uint128_le
let bool_true = True

contract ICOContract(
    init_admin: ByStr20,
    token_impl: ByStr20,
    token_qa_per_zil_qa: Uint128,
    ico_deadline: BNum,
    funding_goal: Uint128
)
(* Current contract admin *)
field contractadmin: ByStr20  = init_admin
(* Admin that can be claimed by existing address *)
field stagingcontractadmin: Option ByStr20 = None {ByStr20}
field registered_investors: Map ByStr20 Bool = Emp ByStr20 Bool

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
procedure IsCorrectImplementation(from: ByStr20)
    is_right_implementation = builtin eq from token_impl;
    match is_right_implementation with
    | True  =>
    | False =>
        e = WrongTokenImplementationAddress;
        ThrowError e
    end
end
procedure NotAfterDeadline()
    blk <- & BLOCKNUMBER;
    in_progress = builtin blt blk ico_deadline;
    match in_progress with
    | True  =>
    | False =>
        e = ICOHasEnded;
        ThrowError e
    end
end
procedure IsAfterDeadline()
    blk <- & BLOCKNUMBER;
    did_end = builtin blt ico_deadline blk;
    match did_end with
    | True  =>
    | False =>
        e = ICODidNotEndYet;
        ThrowError e
    end
end
procedure TransferFunds(tag: String, amt: Uint128, recipient: ByStr20)
    msg = {_tag: tag; _recipient: recipient; _amount: amt};
    msgs = one_msg msg;
    send msgs
end
procedure TransferToken(tag: String, amt: Uint128, recipient: ByStr20)
    msg = {_tag: tag; _recipient: token_impl; _amount: zero; to: recipient; amount: amt};
    msgs = one_msg msg;
    send msgs
end
procedure FundingGoalReached()
    bal <- _balance;
    reached = uint128_le funding_goal bal;
    match reached with
    | True  =>
    | False =>
        e = FundingGoalNotReached;
        ThrowError e
    end
end
procedure FundingGoalNotReached()
    bal <- _balance;
    reached = uint128_le bal funding_goal;
    match reached with
    | True  =>
    | False =>
        e = FundingGoalReached;
        ThrowError e
    end
end
procedure ThisIsRecipient(recipient: ByStr20)
    is_recipient = builtin eq recipient _this_address;
    match is_recipient with
    | True  =>
    | False =>
        e = ThisIsNotTokenRecipient;
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
(* withdraw zils *)
(* only after ico ended *)
(* only if funding goal reached *)
(* only if is admin  *)
transition DrainContractBalance(amt: Uint128)
    IsAfterDeadline;
    FundingGoalReached;
    IsAdmin _sender;
    bal <- _balance;
    TransferFunds addfunds_tag bal _sender;
    e = { _eventname: "DrainContractBalance"; to: _sender; amount: amt};
    event e
end
(* to be able to send the tokens back to admin *)
transition TransferSuccessCallBack(sender: ByStr20, recipient: ByStr20, amount: Uint128)
end
(* to accept tokens *)
(* ALSO USED TO REFUND *)
(* @dev if sender has no entry in the registered_investors it means it is admin *)
transition RecipientAcceptTransfer(sender: ByStr20, recipient: ByStr20, amount: Uint128)
    IsCorrectImplementation _sender;
    ThisIsRecipient recipient;
  	is_registered <- registered_investors[sender];
  	match is_registered with
  	 | Some reg =>
       (* this is a refund scenario *)
       (* only if is after deadline *)
       (* only if funding goal was not reached *)
       IsAfterDeadline;
       FundingGoalNotReached;
       to_refund = builtin div amount token_qa_per_zil_qa;
       TransferFunds addfunds_tag to_refund sender
  	 | None =>
       (* just accept the contract is being funded *)
  	end
end

(* buy tokens at a fixed rate *)
(* can buy before the end of the ico *)
(* @dev register investor in the map*)
transition BuyToken()
    NotAfterDeadline;
    accept;
    token_amt = builtin mul _amount token_qa_per_zil_qa;
    TransferToken transfer_tag token_amt _sender;
    (* register the investor to be able to refund in case of a funding goal failure *)
    registered_investors[_sender] := bool_true
end
`;
