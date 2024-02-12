# Security Report For The BlockMedSecure Project

## Scope:

The audited repos can be found [here](https://github.com/0xBcamp/Alfaqi-janus-dragon/blob/main/solidity/contracts/BlockMedSecure.sol)


## Issues:

**High**
1. Function ```writeMedicalReport``` does not work as intended as reports can be generated for users who have not been added to the database.

***Source:*** [here](https://github.com/0xBcamp/Alfaqi-janus-dragon/blob/main/solidity/contracts/BlockMedSecure.sol#L159C4-L171C6)


**Proof of Concept:** The test provided in the code itself proves this as the ```patient``` was never added to the database.
```
 function testWriteMedicalReport() public {
    // Add a doctor first
        blockMedSecure.addDoctor(doctor, "Dr. Johnson", 5, "Pediatrics");

    // Set the doctor as the sender
        vm.startPrank(doctor);

    // Now, the doctor can write a medical report
        blockMedSecure.writeMedicalReport(patient, 1, "2024-01-20", "ipfs-hash-123");

        vm.stopPrank();
    }
```
A good recommendation would be do add a check in the code to check whether the ```patientAddress``` in ```writeMedicalReport``` exist in the ```patients[]```.



**Mediums**

1. In function ```addDoctor``` there is no check to see whether a doctor has been registered before. The implication of this is that the same data can be entered multiple times and this would mean that a particular doctor/patient would exist more than once in the database. This also applies to the ```addPatient``` function. A good recommendation for this is add a check in the different respective code to check whether the address exist.

**Source:** [here](https://github.com/0xBcamp/Alfaqi-janus-dragon/blob/main/solidity/contracts/BlockMedSecure.sol#L115C5-L127C6)

**POC:**
```
import {Test, console} from "../lib/forge-std/src/Test.sol";
import {BlockMedSecure} from "../src/BlockMedSecure.sol";

contract BlockMedSecureTest is Test {
    BlockMedSecure public blockMedSecure;
    address public doctor = address(2);
    address owner = makeAddr("owner");

    function setUp() public {
        vm.prank(owner);
        blockMedSecure = new BlockMedSecure();
    }


      function test__sameDataCanBeAddedMultipleTimes() public {
        address doctorWalletAddress = doctor; 
        string memory doctorName = "Dr. John Doe Dr. John Doe Dr. John Doe Dr. John Doe";
        uint256 timeExperience =  10;
        string memory specialty = "Cardiology";

        for (uint256 i =  0; i <  100; i++) {
            vm.prank(owner);
            blockMedSecure.addDoctor(doctorWalletAddress, doctorName, timeExperience, specialty);
            (blockMedSecure.getDoctorInfo(doctorWalletAddress));
            console.log(i);

        }
    }
}
```
Running ```forge test --mt test__sameDataCanBeAddedMultipleTimes``` would result in a count from 1-99 which proves that the function will never fail.


**Lows, Informational and Gas Related Issues**
1. No deployment script found(Informational): This is important as it's possible for a deployment script to alter the intention of the contract scope itself. It's hence important that its made available before any review.

2. Insufficient test coverage(Informational).

3. It's not possible to change the admin of the contract. The contract has been initialized with the msg.sender been the sole-admin to the contract, and a situation where that admin's wallet is compromised, the attacker would get hold of the contract. Making provision where the owner can be changed is not in itself a better solution, but it can help mitigate this problem.
