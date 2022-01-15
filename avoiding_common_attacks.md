## Avoiding solidity pitfalls and attacks

* `modifiers` and `require` are properly used whenever possible. 
* `call()` instead of `transfer` or `send` is used when sending the registry fee to the land registry address. 

## Avoiding smart contranct pitfalls and attacks

* `Reentrancy attacks` are prevented by using `Reentrancyguard contract` from OpenZepellin.
* `Replay attacks` (when a signature is reused) are prevented by tracking the nonce for each land title, and hence for each signature, and checking that it is unused before proceeding to register the land title. 