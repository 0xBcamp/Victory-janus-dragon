// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title HealthcareContract
 * @dev A smart contract for managing healthcare-related data on the Ethereum blockchain.
 */
contract BlockMedSecure {
    // Struct to store information about a doctor
    struct Doctor {
        address walletAddress;
        DoctorInfo doctorInfo;
        string[] reportsHistory;
    }

    // Struct to store details about a doctor's professional information
    struct DoctorInfo {
        string name;
        uint256 timeExperience;
        string specialty;
    }

    // Struct to store information about a patient
    struct Patient {
        address walletAddress;
        PatientInfo patientInfo;
        string[] medicalHistory;
        string[] testResults;
    }

    // Struct to store details about a patient's personal information
    struct PatientInfo {
        string preIllness;
        string medications;
        string allergies;
    }

    // Struct to store details about a medical report
    struct MedicalReport {
        address patientAddress;
        address doctorAddress;
        uint256 reportNumber;
        string reportDate;
        string ipfsHash; // Store IPFS hash instead of medicalReport
    }

    ///////////////////
    // State Variables
    ///////////////////

    address public admin;

    // Mappings to associate addresses with corresponding data structures
    mapping(address => Doctor) public doctors;
    mapping(address => Patient) public patients;
    mapping(address => MedicalReport[]) public medicalReports;

    ///////////////////
    // Events
    ///////////////////

    // Events to notify when certain actions occur
    event DoctorAdded(address walletAddress, string name, string specialty);
    event PatientAdded(address walletAddress, string preIllness, string medications, string allergies);
    event MedicalReportAdded(
        address patientAddress, address doctorAddress, uint256 reportNumber, string reportDate, string ipfsHash
    );

    ///////////////////
    // Modifiers
    ///////////////////

    // Modifiers to control access to specific functions
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only the admin can call this function");
        _;
    }

    modifier onlyVerifiedDoctor() {
        require(doctors[msg.sender].walletAddress == msg.sender, "Only verified doctors can call this function");
        _;
    }

    modifier onlyVerifiedPatient() {
        require(patients[msg.sender].walletAddress == msg.sender, "Only verified patients can call this function");
        _;
    }

    /**
     * @dev Constructor function to set the contract deployer as the admin.
     */
    constructor() {
        admin = msg.sender;
    }

    ///////////////////
    // Functions
    ///////////////////

    /**
     * @dev Function to add a new doctor to the system.
     * @param walletAddress The Ethereum address of the doctor.
     * @param name The name of the doctor.
     * @param timeExperience The number of years of experience.
     * @param specialty The medical specialty of the doctor.
     */
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

    /**
     * @dev Function to add a new patient to the system.
     * @param walletAddress The Ethereum address of the patient.
     * @param preIllness Information about the patient's pre-illness state.
     * @param medications Current medications of the patient.
     * @param allergies Any allergies the patient has.
     */
    function addPatient(
        address walletAddress,
        string memory preIllness,
        string memory medications,
        string memory allergies
    ) external onlyAdmin {
        patients[walletAddress] = Patient({
            walletAddress: walletAddress,
            patientInfo: PatientInfo({preIllness: preIllness, medications: medications, allergies: allergies}),
            medicalHistory: new string[](0),
            testResults: new string[](0)
        });

        emit PatientAdded(walletAddress, preIllness, medications, allergies);
    }

    /**
     * @dev Function for a doctor to write a medical report for a patient.
     * @param patientAddress The Ethereum address of the patient.
     * @param reportNumber The number associated with the medical report.
     * @param reportDate The date when the medical report was created.
     * @param ipfsHash The IPFS hash referencing the actual medical report.
     */
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

    ///////////////////
    // Getter Functions
    ///////////////////

    /**
     * @dev Function to retrieve all medical reports for a given patient.
     * @param patientAddress The Ethereum address of the patient.
     * @return An array of MedicalReport structs representing the patient's medical reports.
     */
    function getMedicalReports(address patientAddress) external view returns (MedicalReport[] memory) {
        return medicalReports[patientAddress];
    }

    /**
     * @dev Function to retrieve patient information.
     * @param patientAddress The Ethereum address of the patient.
     * @return The patient's information.
     */
    function getPatientInfo(address patientAddress) external view returns (PatientInfo memory) {
        require(patients[patientAddress].walletAddress == patientAddress, "Patient not found");
        return patients[patientAddress].patientInfo;
    }

    /**
     * @dev Function to retrieve doctor information.
     * @param doctorAddress The Ethereum address of the doctor.
     * @return The doctor's information.
     */
    function getDoctorInfo(address doctorAddress) external view returns (DoctorInfo memory) {
        require(doctors[doctorAddress].walletAddress == doctorAddress, "Doctor not found");
        return doctors[doctorAddress].doctorInfo;
    }
}
