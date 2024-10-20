import Func "mo:base/Func";
import Hash "mo:base/Hash";
import Text "mo:base/Text";

import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Float "mo:base/Float";
import Random "mo:base/Random";
import Time "mo:base/Time";
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";

actor Casino {
    // Store user balances
    private stable var balances : [(Principal, Float)] = [];
    private var balancesMap = HashMap.HashMap<Principal, Float>(10, Principal.equal, Principal.hash);

    // Initialize balances from stable storage
    private func loadBalances() {
        for ((principal, balance) in balances.vals()) {
            balancesMap.put(principal, balance);
        }
    };

    // Save balances to stable storage
    system func preupgrade() {
        balances := Iter.toArray(balancesMap.entries());
    };

    // Clear temporary storage after upgrade
    system func postupgrade() {
        balances := [];
    };

    // Initialize balances
    loadBalances();

    // Function to get user balance
    public query func getBalance(user: Principal) : async Float {
        switch (balancesMap.get(user)) {
            case null 0.0;
            case (?balance) balance;
        }
    };

    // Function to add funds to user balance
    public func addFunds(amount: Float) : async () {
        let user = Principal.fromActor(Casino);
        let currentBalance = await getBalance(user);
        balancesMap.put(user, currentBalance + amount);
    };

    // Function to place a bet
    public shared(msg) func placeBet(amount: Float) : async Text {
        let user = msg.caller;
        let currentBalance = await getBalance(user);

        if (currentBalance < amount) {
            return "Insufficient funds";
        };

        // Generate random number for game outcome
        let seed = await Random.blob();
        let randomNat = Random.rangeFrom(100, seed);
        let randomFloat = Float.fromInt(Int.abs(randomNat)) / 100.0;
        
        // 40% chance of winning
        if (randomFloat < 0.4) {
            let winAmount = amount * 2;
            balancesMap.put(user, currentBalance + winAmount - amount);
            return "You won " # Float.toText(winAmount) # "!";
        } else {
            balancesMap.put(user, currentBalance - amount);
            return "You lost. Better luck next time!";
        }
    };
}
