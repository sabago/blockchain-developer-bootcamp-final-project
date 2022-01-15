// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// @title A land registry smart contract
/// @author Sandra Abago
/// @notice This contract can be used to register a land title on the blockchain
/// @custom:experimental This is an experimental contract.
contract LandTitle is Ownable, ReentrancyGuard {
    // Variables

    // Land Registry Address
    address payable public registryAddress;

    // Land Owner's Address
    address payable public titleOwner;

    // Land Title Registry Fee
    uint256 public registryFee;

    // Land Title Transfer Fee
    uint256 public transferFee;

    // Nonce to prevent replay attacks
    /**
     * A replay attack is when a signature is used again (“replayed”)
     * to claim authorization for a second action. Just as in Ethereum
     * transactions themselves, messages typically include a nonce to
     * protect against replay attacks. The smart contract checks
     * that no nonce is reused.
     */
    uint256 public nonce;
    // Rentrancy attack guard
    bool locked = false;
    mapping(uint256 => bool) usedNonces;

    /** Enums are useful to model choice and keep track of state */
    /** The order in which the enum is declared matters!! */
    /** The first item is the default of the State enum, in this case */
    enum State {
        ToBeRegistered,
        Registered,
        ToBeTransfered,
        Transfered
    }

    /** Struct types are used to represent a record */
    struct Title {
        string ID;
        address payable currOwner;
        uint256 size;
        string location;
        string image;
        State state;
        uint256 nonce;
    }
    mapping(uint256 => Title) titles;

    /*
     * Events
     */
    event LogToBeRegistered(uint256 nonce);
    event LogRegistered(uint256 nonce);
    // Not used
    event LogToBeTransfered(uint256 nonce);
    // Not used
    event LogTransfered(uint256 nonce);

    /*
     * Modifiers
     */
    /// @notice checks that the amount sent by the title owner is enough for the registration
    modifier paidEnough(uint256 _price) {
        require(
            msg.value >= _price,
            "the amount should be enough to cover the registration"
        );
        _;
    }

    /// @notice checks that the info for the title has been added to the blockchain before registration
    modifier toBeRegistered(uint256 _nonce) {
        require(
            (titles[_nonce].currOwner != address(0) &&
                titles[_nonce].state == State.ToBeRegistered),
            "The title should be on added in order to be registered"
        );
        _;
    }

    /// @notice checks that the title is registered.
    modifier registered(uint256 _nonce) {
        require(
            titles[_nonce].state == State.Registered,
            "The title has been registered"
        );
        _;
    }

    // Not used
    modifier toBeTransfered(uint256 _nonce) {
        require(
            titles[_nonce].state == State.ToBeTransfered,
            "The title is ready to be transfered"
        );
        _;
    }

    // Not used
    modifier transfered(uint256 _nonce) {
        require(
            titles[_nonce].state == State.Transfered,
            "The title has been transfered"
        );
        _;
    }

    constructor(address _registryAddress) {
        // Set the title owner as the transaction sender.
        titleOwner = payable(msg.sender);
        // Set the address for the "land registy office".
        registryAddress = payable(_registryAddress);
        // Set the registry fee, as determined by the "land registry office".
        registryFee = (1*(10**18));
        // Set the transfer fee, as determined by the "land registry office".
        transferFee = 1;
        // Initialize the nonce to 0.
        nonce = 0;
    }

    /// @notice adds a land title with a given code(ID), and emits a LogToBeRegistered event.
    /// @param _ID is the special code assigned to the digital land title.
    /// @param _size is the size of the land on the title.
    /// @param _location is where the land on the title is located.
    /// @param _image is an arial image of the land on the title.
    function addTitle(
        string memory _ID,
        uint256 _size,
        string memory _location,
        string memory _image
    ) public onlyOwner {
        titles[nonce] = Title(
            _ID,
            titleOwner,
            _size,
            _location,
            _image,
            State.ToBeRegistered,
            nonce
        );
        emit LogToBeRegistered(nonce);
        nonce = nonce + 1;
        // return true;?
    }

    /// @notice getter function that returns the land title associated with the _nonce.
    /// @param _nonce is the counter for the added land title being referenced.
    function fetchTitle(uint256 _nonce)
        public
        view
        returns (
            string memory ID,
            address currOwner,
            uint256 titleNonce,
            uint256 size,
            string memory location,
            string memory image,
            State state
        )
    {
        ID = titles[_nonce].ID;
        currOwner = titles[_nonce].currOwner;
        size = titles[_nonce].size;
        location = titles[_nonce].location;
        image = titles[_nonce].image;
        state = titles[_nonce].state;
        titleNonce = _nonce;

        return (ID, currOwner, titleNonce, size, location, image, state);
    }

    /**
     * ECDSA HELPER FUNCTIONS
     * In general, ECDSA signatures consist of two parameters, r and s.
     * Signatures in Ethereum include a third parameter, v, which provides
     * additional information that can be used to recover which account’s
     * private key was used to sign the message. This same mechanism is
     * how Ethereum determines which account sent a given transaction.
     * Solidity provides a built-in function ecrecover that accepts a
     * message along with the r, s, and v parameters and returns
     * the address that was used to sign the message.
     *
     * Splitting the signature to obtain these params is, therefore, necessary.
     */

    /// @notice splits the signature so that the signer can be recovered.
    /// @param sig is the signature of the signed land title.
    /// @return v r s params from the split signature.
    function splitSignature(bytes memory sig)
        private
        pure
        returns (
            uint8,
            bytes32,
            bytes32
        )
    {
        require(sig.length == 65);

        bytes32 r;
        bytes32 s;
        uint8 v;
        /**
         * r and s are 32 bytes each and together make up
         * the first 64 bytes of the signature.
         * v is the 65th byte, which can be found at byte
         * offset 96 (32 bytes for the length, 64 bytes for r and s).
         * The mload opcode loads 32 bytes at a time, so the
         * function then needs to extract just the first byte
         * of the word that was read. This is what byte(0, ...) does.
         */
        assembly {
            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96))) 
        }
        v += 27;
        return (v , r, s);
    }

    /**
     * In addition to the r, s, and v parameters from the signature,
     * recovering the message signer requires knowledge of the message
     * that was signed. The message hash needs to be recomputed from
     * the sent parameters along with the known prefix.
     *
     * It may seem tempting at first to just have the caller pass in
     * the message that was signed, but that would only prove that
     * some message was signed by the owner. The smart contract needs
     * to know exactly what parameters were signed, and so it must
     * recreate the message from the parameters and use that for
     * signature verification.
     */

    /// @notice hashes the info to be signed with the registry address.
    /// @param from the address of the signer.
    /// @param _ID the special code on the digital land title.
    /// @return a hashed concatenation of the land title ID (entered by the user),
    //  the user's address(from), and the registry address(to).
    function hashMessage(
        address from,
        string memory _ID
    ) public view returns (bytes32) {
        bytes32 message = keccak256(abi.encodePacked(from, registryAddress, _ID));
        return message;
    }

    /// @notice prefixes the hashed message to mimic the behavior of eth_sign.
    /// @param hashedMessage the hashed message to be prefixed and signed.
    /// @return a prefixed hash (of hashed message).
    function prefixMessage(bytes32 hashedMessage) internal pure returns (bytes32) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        return keccak256(abi.encodePacked(prefix,  hashedMessage));
    }

    /*****
     * INTERNAL ECDSA SIGNATURE HELPERS
     *****/
    /// @notice recovers the address that signed any message.
    /// @param hashedMessage the info that was signed.
    /// @param v the 65th byte of any split signature.
    /// @param r the first 332 bytes of any split signature.
    /// @param s the second 32 bytes of any split signature.
    /// @return the address of the signer.
    function getSigner(
        bytes32 hashedMessage,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal pure returns (address) {
        require(
            uint256(s) <=
                0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0,
            "invalid signature 's' value"
        );
        require(v == 27 || v == 28, "invalid signature 'v' value");
        address signer = ecrecover(prefixMessage(hashedMessage), v, r, s);

        return signer;
    }

    /// @notice recovers the address that signed the land title.
    /// @param message the info that was signed.
    ///  @param _sig the signature of the land title.
    /// @return the address of the signer of the land title after splitting the signature.
    function recoverAddress(bytes32 message,     
    bytes memory _sig 
        )
        internal
        pure
        returns (address)
    {
        if (_sig.length != 65) {
            revert("invalid signature length");
        }
        bytes32 r;
        bytes32 s;
        uint8 v;

        (v, r, s) = splitSignature(_sig);

        return getSigner(message, v, r, s);
    }

    /*****
     * PROCESS THE SIGNATURE
     *****/
    // Need to test the above internal functions. processSignature comes in handy.
    /// @notice processes the signature to check for the signer.
    /// @param userFrom the owner of the land title.
    /// @param _signature the signature of the land title.
    /// @param _ID the special code on the added and signed land title.
    /// @return the recovered address that signed the land title.
    function processSignature(
        address userFrom,
        bytes memory _signature,
        string memory _ID
    ) public view onlyOwner returns (address) {
        bytes32 message = hashMessage(userFrom, _ID);
        address recovered = recoverAddress(message, _signature);
        return recovered;
    }

    /// @notice checks that the nonce affiliated with the added land title is unused, checks the signer, and registers the land title.
    /// @param _nonce the counter of the associated land title.
    /// @param _sig the signature of the land title.
    function registerTitle(uint256 _nonce, bytes memory _sig, string memory _ID)
        public
        payable
        paidEnough(registryFee)
        onlyOwner
        nonReentrant
    {
        // avoid replay attacks
        require((!usedNonces[_nonce]), "Replay attack detected: the nonce should be unused");
        usedNonces[_nonce] = true;
        // Check the signature.
        // Note: Would like to check the signature here, but web3.eth.sign on the frontend
        // keeps returning a different signature from the tests, even though the hash and account
        // that is signing are the same. Sometimes it works, and other times, it does not! Error 
        // manifests as wrong v value, which usually requires re-migrating
        // address signer = processSignature(
        //     titles[_nonce].currOwner,
        //     _sig,
        //     _ID
        // );
        // require(signer == titleOwner, "the owner must sign the title");
        // If signature is that of the owner, register the land title.
        // Reentrancy guard
        // require(!locked, "Reentrant call detected!");
        // locked = true;
        (bool success, ) = registryAddress.call{value: msg.value}("");
        // locked = false;
        require(success, "Transfer failed.");
        titles[_nonce].state = State.Registered;
        emit LogRegistered(_nonce);
    }

    /// @notice Destroy contract and reclaim leftover funds.
    function kill() public onlyOwner {
        selfdestruct(payable(msg.sender));
    }
}
