## Inheritance and Interfaces

In `LandTitle.sol`, two contracts are inherited and extended from the `Openzepellin library`: 

* The `Ownable contract` that provides a modifier to make sure only the owner can call certain functions. In `LandTitle.sol`, this modifier is used on functions that change on-chain state.
* The `Reentrancyguard contract` is also used to prevent a reentrancy attack when the owner calls the `registerTitle()` function and hence sends the registration fee to the land registry.

## Access Control Design Patterns

This is achieved by utilizing the `isOwner` modifier from the Ownable (openzepellin) contract.