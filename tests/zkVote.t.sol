// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { Test } from "forge-std/src/Test.sol";
import "../contracts/zkVote.sol";
import {HonkVerifier} from "../circuits/target/Verifier.sol";

contract VotingTest is Test {
    zkVote public voteContract;
    HonkVerifier public verifier;

    bytes proofBytes;
    uint256 deadline = block.timestamp + 10000000;

    bytes32 merkleRoot;
    bytes32 nullifierHash;


    function setUp() public {
        merkleRoot = bytes32(0x215597bacd9c7e977dfc170f320074155de974be494579d2586e5b268fa3b629);
        nullifierHash = bytes32(0x079d88735cdd786b64a950b1cd887ae89308e3b4176ef4adb308267888fe1f91);

        verifier = new HonkVerifier();
        voteContract = new zkVote(merkleRoot, address(verifier));
        voteContract.propose("First proposal", deadline);

        bytes memory proof = vm.readFileBinary(
            "./circuits/target/proof-clean"
        );
        proofBytes = proof;
    }

    function test_validVote() public {
        voteContract.castVote(proofBytes, 0, 1, nullifierHash);
    }

    function test_invalidProof() public {
        vm.expectRevert();
        voteContract.castVote(hex"12", 0, 1, nullifierHash);
    }

    function test_doubleVoting() public {
        voteContract.castVote(proofBytes, 0, 1, nullifierHash);

        vm.expectRevert("Proof has been already submitted");
        voteContract.castVote(proofBytes, 0, 1, nullifierHash);
    }

    function test_changedVote() public {
        vm.expectRevert();
        voteContract.castVote(proofBytes, 0, 0, nullifierHash);
    }
}
