![](./media/mercury_logo.png)

# Pseudocode for the Mercury Project

Below are pseudocodes that will help us understand the requirements of the smart contracts that will power Mercury, as well guide the overall development of the Mercury Project.

## Wallet Monitor

- This pseudo-smart contract powers the 'Connect Wallet' feature. Registered users connect their wallets to the platform so that Mercury can monitor all ag-EUR related activities.

    - Objective: Allow registered users to connect their wallets securely to the platform.
    - Smart Contract Pseudocode: 

        ```solidity
        Contract WalletMonitor {
            mapping (address => bool) public connectedWallet;
            address[] public listOfConnectedWallets;

            function connectWallet() external {
                connectedWallet[msg.sender] = true;
                listOfConnectedWallets.push(msg.sender);
            }

            modifier onlyConnectedWallet() {
                require(connectedWallet[msg.sender], "Wallet not connected!");
                _;
            }

            // Other functions to manage wallet connections
        }
        ```

## Transaction Monitor

- This pseudo-smart contract enables the wallet monitoring functionality of Mercury. 

    - Objective: Observing transactions on the agEUR stablecoin for the connected wallet.
    - Smart Contract Pseudocode: 

        ```solidity
        Contract TransactionMonitor is WalletMonitor {
            event TransactionAlert(address sender, address receiver, uint256 amount, string transactionType);

            address public immutable i_agEURToken;

            constructor() {
                i_agEURToken = // address of agEUR token;
            }

            function monitorTransaction(address receiver, address token, uint256 amount) internal onlyConnectedWallet{
                // check if the transfer is for agEUR
                require(token == i_agEURToken, "");
                // Logic to monitor transactions on the agEUR token goes below 
                // ......
                // Emit event based on transaction type 
                emit TransactionAlert(msg.sender, receiver, amount, "Credit!");
                // or 
                emit TransactionAlert(msg.sender, receiver, amount, "Debit!");


            }
        }
        ```

## Alert Notifier

- This pseudo-smart contract powers the notification feature of Mercury.

    - Objective: Sending email alerts to users based on monitored transactions.
    - Smart Contract Pseudocode:

        ```solidity
        contract AlertNotifier is TransactionMonitor {
            // integrate with an external email service
            private string emailService;

            event EmailAlertSent(address indexed userWallet, string alertType, uinr256 amount);

            address public immutable i_mercuryAdmin;

            constructor() {
                i_mercuryAdmin = msg.sender;
            }

            function setEmailService(string memory emailService_) public onlyMercuryAdmin returns(string memory) {
                emailService = emailService_;
            }

            function sendEmailAlert(string memory alertType, uint256 amount) internal {
                // Logic to send email alerts 
                emit EmailAlertSent(userWallet, alertType, amount);
            }

            modifier onlyMercuryAdmin() {
                require(msg.sender == i_mercuryAdmin, "");
                _;
            }
        }
        ```