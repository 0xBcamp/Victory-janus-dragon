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

    // test to confirm that any number can be added as timeExperience...this test was done before check was added to addDoctor
    /* function test_Hippo() public {
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
    } */

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

    // this particular test failed
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

}
