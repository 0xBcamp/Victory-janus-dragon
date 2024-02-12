# Security Report For The BlockMedSecure Project

## Scope:

The audited repos can be found [here](https://github.com/0xBcamp/Alfaqi-janus-dragon/blob/main/solidity/contracts/BlockMedSecure.sol)


## Issues:

- ### Non-verified patients can be added to the system

  - #### Source:

      https://github.com/0xBcamp/Alfaqi-janus-dragon/blob/main/solidity/contracts/BlockMedSecure.sol#L157-L171

  - #### Risk:

      Function `writeMedicalReport` does not work as intended as reports can be generated for users who have not been added to the database.

  - #### Proof of Concept:

      ```solidity
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

  - #### Recommended Mitigation:

      A check should be included in the `writeMedicalReport` to ensure that added `patientAddress` exist in the system

      ```solidity
       function writeMedicalReport(
          address patientAddress,
          uint256 reportNumber,
          string memory reportDate,
          string memory ipfsHash
      ) external onlyVerifiedDoctor {
           // Ensure the patient is registered in the system before proceeding
          require(patients[patientAddress].walletAddress == patientAddress, "Patient does not exist in the system");

          medicalReports[patientAddress].push(
              MedicalReport({
                  patientAddress: patientAddress,
                  doctorAddress: msg.sender,
                  reportNumber: reportNumber,
                  reportDate: reportDate,
                  ipfsHash: ipfsHash
              })
          );

          doctors[msg.sender].reportsHistory.push(ipfsHash);

          emit MedicalReportAdded(patientAddress, msg.sender, reportNumber, reportDate, ipfsHash);
      }
      ```

  - #### Recommended Mitigation Test:

      ```solidity
      // SPDX-License-Identifier: MIT
      pragma solidity ^0.8.19;

      import {Test, console2} from "forge-std/Test.sol";
      import {BlockMedSecure} from "../src/BlockMedSecure.sol";

      contract BlockMedTest is Test {
          BlockMedSecure public blockMedSecure;

          address public admin = address(1);
          address public doctor = address(2);
          address public patient = address(3);
          address public fakePatient = address(4); 

          function setUp() public {
              blockMedSecure = new BlockMedSecure();
          }

          function testWriteMedicalReportForFakePatient() public {
              // Attempt to add a doctor first
              blockMedSecure.addDoctor(doctor, "Dr. Johnson", 15, "Pediatrics");

              // Set the doctor as the sender
              vm.startPrank(doctor);

              vm.expectRevert("Patient does not exist in the system");

              // Attempt to write a medical report for a non-existent patient, this should fail as per our expectations
              blockMedSecure.writeMedicalReport(fakePatient, 1, "2024-01-20", "ipfs-hash-123");

              vm.stopPrank();
          }
      }

  - ### No limit on time experience

  - #### Source:

      https://github.com/0xBcamp/Alfaqi-janus-dragon/blob/main/solidity/contracts/BlockMedSecure.sol#115-127

  - #### Risk:

      When calling the `addDoctor` function, there is no limit/range for the `timeExperience` parameter. Hippocrates could sign up yunno 😂

  - #### Proof Of Concept:

      ```solidity
      function test_Hippo() public {
          // add a doctor
          blockMedSecure.addDoctor(doctor, "Hippocrates", 5000, "OG General Medicine");

          vm.startPrank(admin);

          // retrieve doctor information
          (address walletAddress, BlockMedSecure.DoctorInfo memory doctorInfo) = blockMedSecure.doctors(doctor);

          // create a Doctor struct
          BlockMedSecure.Doctor memory addedDoctor = BlockMedSecure.Doctor({
              walletAddress: walletAddress,
              doctorInfo: doctorInfo,
              reportsHistory: new string[](0)
          });

          // accessing individual properties of the Doctor struct
          string memory doctorName = addedDoctor.doctorInfo.name;
          uint256 timeExperience = addedDoctor.doctorInfo.timeExperience;
          string memory specialty = addedDoctor.doctorInfo.specialty;

          // asserting
          assertEq(addedDoctor.walletAddress, doctor);
          assertEq(doctorName, "Hippocrates");
          assertEq(timeExperience, 5000);
          assertEq(specialty, "OG General Medicine");

          vm.stopPrank();
      }
      ```

  - #### Recommended Mitigation:

      Add check in `addDoctor` function that checks that inputed value for `timeExperience` is in a particular range. Say 10 - 50

      ```solidity
       function addDoctor(address walletAddress, string memory name, uint256 timeExperience, string memory specialty)
          external
          onlyAdmin
      {

          // check that timeExperience is in a particular range
          require(timeExperience >= 10 && timeExperience <= 50, "Time experience is invalid");
          doctors[walletAddress] = Doctor({
              walletAddress: walletAddress,
              doctorInfo: DoctorInfo({name: name, timeExperience: timeExperience, specialty: specialty}),
              reportsHistory: new string[](0)
          });

          emit DoctorAdded(walletAddress, name, specialty);
      }
      ```

  - #### Recommended Mitigation Test: 

    ```solidity
    function testAddDoctorWithValidExperience() public {
        // add doctor with valid experience
        blockMedSecure.addDoctor(doctor, "Dr. Balanced", 25, "ObGyn");

        vm.startPrank(admin);

        // Verify the doctor was added
        BlockMedSecure.DoctorInfo memory doctorInfo = blockMedSecure.getDoctorInfo(doctor);
        assertEq(doctorInfo.name, "Dr. Balanced");
        assertEq(doctorInfo.timeExperience, 25);
        assertEq(doctorInfo.specialty, "ObGyn");

        vm.stopPrank();
    }
    ```

    ```solidity
    function testAddDoctorWithInvalidExperience() public {
        // add a doctor
        blockMedSecure.addDoctor(doctor, "Hippocrates", 10000, "OG General Medicine");

        vm.startPrank(admin);

        // verify the doctor was added
        BlockMedSecure.DoctorInfo memory doctorInfo = blockMedSecure.getDoctorInfo(doctor);
        assertEq(doctorInfo.name, "Hippocrates");
        assertEq(doctorInfo.timeExperience, 10000);
        assertEq(doctorInfo.specialty, "General Medicine");

        // Expecting the transaction to revert due to invalid timeExperience
        vm.expectRevert("Time experience is invalid");

        vm.stopPrank();
    }
    ```

- ### Lows, Informational, Gas Issues

    - It's not possible to change the admin of the contract. The contract has been initialized with the msg.sender been the sole-admin to the contract, and a situation where that admin's wallet is compromised, the attacker would get hold of the contract. Making provision where the owner can be changed is not in itself a better solution, but it can help mitigate this problem.
  
    - No deployment script found(Informational): This is important as it's possible for a deployment script to alter the intention of the contract scope itself. It's hence important that its made available before any review.
  
    - Insufficient test coverage(Informational).