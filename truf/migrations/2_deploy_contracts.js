var Factory = artifacts.require("Factory");
var TestToken = artifacts.require("TestToken");
const actualSender = "0x15C181409E7D69B7a62bc5056ea02A1874Bb3B16";
module.exports = function(deployer) {

  deployer.then(async () => {
      console.log('Enter');
      let facIn = await deployer.deploy(Factory);
      console.log('FacIn');
      await facIn.createReceiver(0, {from: actualSender});
      console.log('Created');
      let bankAddr = facIn.getAddress(0, {from: actualSender});
      console.log(bankAddr);
      await deployer.deploy(TestToken, bankAddr);
      console.log('All Good');
      //...
  })
  .catch(console.log);

    // deployer.deploy(Factory)
    // .all((facInstance) => {
    //   console.log('Factory Delpoyed');
    //   //console.log(facInstance);
    //
    //   facInstance.createReceiver(0, {from: actualSender})
    //   .then((txRes) => {
    //     console.log('Receiver Created');
    //
    //     facInstance.getAddress(0, {from: actualSender})
    //     .then((bankAddr) => {
    //       console.log('Got Address:');
    //       console.log(bankAddr);
    //       return deployer.deploy(TestToken, bankAddr);
    //     });
    //   });
    //
    // })
    // .catch(console.log);
    // Additional contracts can be deployed here
};
