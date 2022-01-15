const { assert } = require("chai");
const LandTitle = artifacts.require("LandTitle");
const { titles: TitleStruct, isDefined, isPayable, isType } = require("./ast-helper");
const { ethers } = require('ethers');
const Web3 = require('web3');
const web3 = new Web3(Web3.givenProvider || 'ws://localhost:8545');
let BN = web3.utils.BN;
const truffleAssert = require('truffle-assertions');
let { catchRevert } = require("./exceptionsHelpers.js");

contract("LandTitle",  ( accounts ) => {
  const [ _owner, registryAddress, alice] = accounts;

  const _ID = "a1b2c3d4e5f6";
  const _size = 2400 ; // in square feet
  const _location = "location string";
  const _image = "image url"; 
  const _registryFee = "1000000000000000000";
  const _notEnoughRegistryFee = "0";

  describe('deployment', () => {
    it("should assert true", async () => {
      await LandTitle.deployed();
      return assert.isTrue(true);
    });
  });

  let instance;
  beforeEach(async () => {
    await LandTitle.deployed();
    instance = await LandTitle.new(registryAddress);
  });

  
  describe("Variables", () => {
    it("should have a registryAddress", async () => {
      assert.equal(typeof instance.registryAddress, 'function', "the contract has no registryAddress");
    });

    it("should have an ownerAddress", async () => {
      assert.equal(typeof instance.owner, 'function', "the contract has no owner address");
    });

    it("should have a registryFee", async () => {
      assert.equal(typeof instance.registryFee, 'function', "the contract has no registryFee");
    });

    it("should have a tranferFee", async () => {
      assert.equal(typeof instance.transferFee, 'function', "the contract has no transferFee");
    });
  });

  describe("enum State", () => {
    let enumState;
    before(() => {
      enumState = LandTitle.enums.State;
      assert(
        enumState,
        "The contract should define an Enum called State"
      );
    });

    it("should define `ToBeRegistered`", () => {
      assert(
        enumState.hasOwnProperty('ToBeRegistered'),
        "The enum does not have a `ToBeRegistered` value"
      );
    });

    it("should define `Registered`", () => {
      assert(
        enumState.hasOwnProperty('Registered'),
        "The enum does not have a `Registered` value"
      );
    });

    it("should define `ToBeTransfered`", () => {
      assert(
        enumState.hasOwnProperty('ToBeTransfered'),
        "The enum does not have a `ToBeTransfered` value"
      );
    });

    it("should define `Transfered`", () => {
      assert(
        enumState.hasOwnProperty('Transfered'),
        "The enum does not have a `Transfered` value"
      );
    });
  });

  describe("Title struct", () => {
    // let subjectStruct;
    let subjectStruct;

      before(() => {
        subjectStruct = TitleStruct(LandTitle);
        assert(
          subjectStruct !== null, 
          "The contract should define an `Item Struct`"
        );
      });

    it("should have an `ID`", () => {
      assert(
        isDefined(subjectStruct)("ID"), 
        "Struct Item should have a `ID` member"
      );
      assert(
        isType(subjectStruct)("ID")("string"), 
        "`ID` should be of type `string`"
      );
    });

    it("should have a `currOwner`", () => {
      assert(
        isDefined(subjectStruct)("currOwner"), 
        "Struct Item should have a `currOwner` member"
      );
      assert(
        isType(subjectStruct)("currOwner")("address"), 
        "`size` should be of type `address`"
      );
      assert(
        isPayable(subjectStruct)("currOwner"), 
        "`currOwner` should be payable"
      );
    });

    it("should have an `size`", () => {
      assert(
        isDefined(subjectStruct)("size"), 
        "Struct Item should have a `size` member"
      );
      assert(
        isType(subjectStruct)("size")("uint256"), 
        "`size` should be of type `uint256`"
      );
    });

    it("should have an `location`", () => {
      assert(
        isDefined(subjectStruct)("location"), 
        "Struct Item should have a `location` member"
      );
      assert(
        isType(subjectStruct)("location")("string"), 
        "`location` should be of type `string`"
      );
    });

    it("should have an `image`", () => {
      assert(
        isDefined(subjectStruct)("image"), 
        "Struct Item should have a `image` member"
      );
      assert(
        isType(subjectStruct)("image")("string"), 
        "`image` should be of type `string`"
      );
    });

    it("should have a `nonce`", () => {
      assert(
        isDefined(subjectStruct)("nonce"),
        "Struct Item should have a `nonce` member"
      );
      assert(
        isType(subjectStruct)("nonce")("uint256"),
        "`nonce` should be of type `uint256`"
      );
    });
  });

  describe("Use cases", () => {
      it("should add a Land Title with the validated keycode as an ID, and prepopuldated values", async () => {
        await instance.addTitle(_ID, _size, _location, _image, { from: _owner });
        const result = await instance.fetchTitle.call(0);
  
        assert.equal(
          result[0],
          _ID,
          "the ID of the last added Land Title does not match the expected value",
        );
        assert.equal(
          result[1],
          _owner,
          "the currOwner address should be set to the currOwner when a Land Title is added",
        );
        assert.equal(
          result[2].toString(10),
          0,
          'the nonce of the first added item should be "0"',
        );
        assert.equal(
          result[3].toString(10),
          _size,
          "the size of the last added Land Title does not match the expected value",
        );
        assert.equal(
          result[4],
          _location,
          "the location of the last added Land Title does not match the expected value",
        );
        assert.equal(
          result[5],
          _image,
          "the image of the last added Land Title does not match the expected value",
        );
        assert.equal(
          result[6].toString(10),
          LandTitle.State.ToBeRegistered,
          'the state of the item should be "To Be Registered"',
        );
      });
  
        it("should revert when someone that is not the owner tries to call addTitle()", async () => {
        await catchRevert(instance.addTitle(_ID, _size, _location, _image, { from: alice }));
    });
      it("should emit a LogToBeRegistered event when a Land Title is added", async () => {
        let eventEmitted = false;
        const tx = await instance.addTitle(_ID, _size, _location, _image, { from: _owner });
  
        if (tx.logs[0].event == "LogToBeRegistered") {
          eventEmitted = true;
        }
  
        assert.equal(
          eventEmitted,
          true,
          "adding a Land Title should emit a LogToBeRegistered event",
        );
      });

      
    it('Signature generated', async () => {
        // Generate signature
        let mes = await instance.hashMessage(_owner, _ID)
        let mesGenerated = 
          ethers.utils.solidityKeccak256(
              ['bytes'],
              [
                  ethers.utils.solidityPack(
                      ['address', 'address', 'string'],
                      [_owner, registryAddress, _ID]
                  )
              ]
          )
        console.log("***owner", _owner);
        console.log("***Registry", registryAddress);
        expect(mes.toString(), "Wrong signature").to.equal(mesGenerated.toString());
        console.log("***hash", mesGenerated);
        mesSigned = await web3.eth.sign(mesGenerated, _owner);
        console.log("***sig", mesSigned);
    });

    it('processes the signature', async () => {
      await truffleAssert.passes(
            instance.processSignature(_owner, mesSigned, _ID, {from: _owner})
        );
    });

      it("recovers the signer as the owner", async ()=> {
        await instance.addTitle(_ID, _size, _location, _image, { from: _owner });
        const signer = await instance.processSignature(_owner, mesSigned, _ID, {from: _owner});
        assert(signer, "the title must be signed");
        assert.equal( signer, _owner, "the title must be signed by the owner");
      });

      it("should revert when someone that is not the owner tries to call processSignature()", async () => {
        await instance.addTitle(_ID, _size, _location, _image, { from: _owner });
        await catchRevert(instance.processSignature(_owner, mesSigned, _ID, {from: alice}));
    });

    it('registers a title', async () => {
     await instance.addTitle(_ID, _size, _location, _image, { from: _owner });

      let ownerBalanceBefore = await web3.eth.getBalance(_owner);
      let registryBalanceBefore = await web3.eth.getBalance(registryAddress);

      const registerTx = await instance.registerTitle(0, mesSigned, _ID, {from: _owner, value: _registryFee});
      assert(registerTx, "title should be registed");

      let ownerBalanceAfter = await web3.eth.getBalance(_owner);
      let registryBalanceAfter = await web3.eth.getBalance(registryAddress);

      const registeredTitle = await instance.fetchTitle.call(0);
      assert.equal(
        registeredTitle[6].toString(10),
        LandTitle.State.Registered,
        'the state of the title should be "Registered"',
      );

      assert.equal(
        new BN(registryBalanceAfter).toString(),
        new BN(registryBalanceBefore).add(new BN(_registryFee)).toString(),
        "the registry's balance should be increased by the registryFee",
      );

      assert.isBelow(
        Number(ownerBalanceAfter),
        Number(new BN(ownerBalanceBefore).sub(new BN(_registryFee))),
        "the owner's balance should be reduced by more than the registryFee (including gas costs)",
      );
    });

    it("should revert when someone that is not the owner tries to call registerTitle()", async () => {
        await instance.addTitle(_ID, _size, _location, _image, { from: _owner });
        await catchRevert(instance.registerTitle(0, mesSigned, _ID, {from: alice, value: _registryFee}));
    });

    it("should error when not enough value is sent when registering a land title", async () => {
      await instance.addTitle(_ID, _size, _location, _image, { from: _owner });
      await catchRevert(instance.registerTitle(0, mesSigned, _ID, {from: _owner, value: _notEnoughRegistryFee}));
    });
    
    it("should emit a LogRegistered event when a Land Title is registered", async () => {
     await instance.addTitle(_ID, _size, _location, _image, { from: _owner });
      
      let eventEmitted = false;
      const registerTx = await instance.registerTitle(0, mesSigned, _ID, {from: _owner, value: _registryFee});

      if (registerTx.logs[0].event == "LogRegistered") {
        eventEmitted = true;
      }

      assert.equal(
        eventEmitted,
        true,
        "registering a Land Title should emit a LogRegistered event",
      );
    });
  });


});
