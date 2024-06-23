use starknet::ContractAddress;
use starknet::get_caller_address;

#[starknet::interface]
    trait IContract<TContractState> {
        fn open_channel(ref self: TContractState, _participant: ContractAddress, _amount: u256);
        fn close_channel(ref self: TContractState);
        fn update_state(ref self: TContractState, _new_state: u256);
        fn get_state(self: @TContractState) -> u256;
    }

    
#[starknet::contract]
mod StateChannel{
   
    use starknet::{get_caller_address, get_contract_address};
    use super::{ContractAddress, IContract};
    

    #[storage]
    struct Storage {
        // Participants in the state channel
        participant_a: ContractAddress,
        participant_b: ContractAddress,
        // State of the channel
        state: u256,
        // Channel balance
        balance: u256,
        // Channel status
        is_open: bool,
    }

    #[constructor]
    fn constructor(ref self: ContractState) {
        self.participant_a.write(get_caller_address());
        self.is_open.write(false);
    }
    
    #[abi(embed_v0)]
    impl Contract of IContract<ContractState> {
        fn open_channel(ref self: ContractState, _participant: ContractAddress, _amount: u256) {
            assert!(self.is_open.read() == false, "Channel already open");
            self.participant_b.write(_participant);
            self.balance.write(_amount);
            self.state.write(0);
            self.is_open.write(true);
        }

        fn close_channel(ref self: ContractState) {
            assert!(self.is_open.read() == true, "Channel not open");
            self.is_open.write(false);
        }

        fn update_state(ref self: ContractState, _new_state: u256) {
            assert!(self.is_open.read() == true, "Channel not open");
            self.state.write(_new_state);
        }

        fn get_state(self: @ContractState) -> u256 {
            self.state.read()
        }
    }
}