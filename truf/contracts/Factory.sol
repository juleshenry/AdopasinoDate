pragma solidity ^0.5.16;

/*
    Just the interface so solidity can compile properly
    We could skip this if we use generic call creation or abi.encodeWithSelector
*/
contract ERC20 {
    function totalSupply() public view returns (uint);
    function balanceOf(address tokenOwner) public view returns (uint balance);
    function allowance(address tokenOwner, address spender) public view returns (uint remaining);
    function transfer(address to, uint tokens) public returns (bool success);
    function approve(address spender, uint tokens) public returns (bool success);
    function transferFrom(address from, address to, uint tokens) public returns (bool success);
    event Transfer(address indexed from, address indexed to, uint tokens);
    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
}

/*
    Generic Receiver Contract
*/
contract Receiver {

    address public owner;

    constructor() public {
        /*
            Deployer's address ( Factory in our case )
            do not pass this as a constructor argument because
            etherscan will have issues displaying our validated source code
        */
        owner = msg.sender;
    }

    /*
        @notice Send funds owned by this contract to another address
        @param tracker  - ERC20 token tracker ( DAI / MKR / etc. )
        @param amount   - Amount of tokens to send
        @param receiver - Address we're sending these tokens to
        @return true if transfer succeeded, false otherwise
    */
    function sendFundsTo( address tracker, uint256 amount, address receiver) public returns ( bool ) {
        // callable only by the owner, not using modifiers to improve readability
        require(msg.sender == owner);

        // Transfer tokens from this address to the receiver
        return ERC20(tracker).transfer(receiver, amount);
    }

    function getBalance(address tokenOwner, address tracker) public view returns (uint) {
        require(msg.sender == owner);

        return ERC20(tracker).balanceOf(tokenOwner);
    }

    // depending on your system,  you probably want to suicide this at some
    // point in the future, or reuse it for other clients
}


/*
    Factory Contract
*/

contract Factory {

    address public owner;
    mapping ( uint256 => address ) public receiversMap;
    uint256 receiverCount = 0;

    constructor() public {
        /*
            Deployer's address ( Factory in our case )
            do not pass this as a constructor argument because
            etherscan will have issues displaying our validated source code
        */
        owner = msg.sender;
    }

    /*
        @notice Create a number of receiver contracts
        @param number  - 0-255
    */
    function createReceiver(uint256 recCount) public {
        require(msg.sender == owner);

        receiversMap[recCount] = address(new Receiver());
        if (recCount > receiverCount) {
            receiverCount = recCount;
        }
    }


    /*
        @notice Send funds in a receiver to another address
        @param ID       - Receiver indexed ID
        @param tracker  - ERC20 token tracker ( DAI / MKR / etc. )
        @param amount   - Amount of tokens to send
        @param receiver - Address we're sending tokens to
        @return true if transfer succeeded, false otherwise
    */
    function sendFundsFromReceiversTo( uint256[] memory IDs, address tracker, uint256[] memory amounts, uint256[] memory receivers ) public {
        require(msg.sender == owner);

        for(uint256 i = 0; i < IDs.length; i++) {
            if (amounts[i] > 0) {
                Receiver( receiversMap[IDs[i]] ).sendFundsTo( tracker, amounts[i], receiversMap[receivers[i]]);
            }
        }
    }

    /*
        Batch Collection - Should support a few hundred transfers

        @param tracker           - ERC20 token tracker ( DAI / MKR / etc. )
        @param receiver          - Address we're sending tokens to
        @param contractAddresses - we send an array of addresses instead of ids, so we don't need to read them ( lower gas cost )
        @param amounts           - array of amounts

    */

    function getBalance(uint256 ID, address tracker) public view returns (uint){
        require(msg.sender == owner);

        return Receiver( receiversMap[ID] ).getBalance(receiversMap[ID], tracker);
    }

    function getAddress(uint256 ID) public view returns (address){
        require(msg.sender == owner);

        return receiversMap[ID];
    }

    function getLatest() public view returns (uint256){
	require(msg.sender == owner);
        return receiverCount;
    }

    function setLatest(uint256 recCount) public returns (uint256){
        require(msg.sender == owner);
        receiverCount = recCount;
    }

    function refillDaily(address tracker, uint256 val) public {
        require(msg.sender == owner);
        uint256 bal;
        for(uint256 i = 1; i <= receiverCount; i++) {
            if (receiversMap[i] != address(0)) {
                bal = Receiver( receiversMap[i] ).getBalance(receiversMap[i], tracker);
                if (bal < val) {
                    Receiver( receiversMap[0] ).sendFundsTo( tracker, val-bal, receiversMap[i]);
                }
            }
        }
    }

}
