// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PokaEscrow
 * @notice Minimal, secure autonomous escrow lockbox for POKA agreements on Celo.
 * Supports native CELO and ERC-20 stablecoins (cUSD, USA₮, cNGN, USDC).
 */
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract PokaEscrow {
    enum EscrowStatus { NONE, DEPOSITED, SETTLED, REFUNDED }

    struct AgreementEscrow {
        address buyer;
        address seller;
        address token; // address(0) for native CELO
        uint256 amount;
        EscrowStatus status;
        uint256 createdAt;
    }

    address public immutable agent;
    mapping(bytes32 => AgreementEscrow) public agreements;

    event Deposited(bytes32 indexed agreementId, address indexed buyer, address indexed seller, address token, uint256 amount);
    event Settled(bytes32 indexed agreementId, address indexed recipient, uint256 amount);
    event Refunded(bytes32 indexed agreementId, address indexed recipient, uint256 amount);

    modifier onlyAuthorized(bytes32 agreementId) {
        AgreementEscrow storage esc = agreements[agreementId];
        require(msg.sender == agent || msg.sender == esc.buyer, "POKA: Unauthorized");
        _;
    }

    constructor(address _agent) {
        require(_agent != address(0), "Invalid agent");
        agent = _agent;
    }

    /**
     * @notice Deposit native CELO into escrow for a specific agreement
     */
    function depositNative(bytes32 agreementId, address seller) external payable {
        require(msg.value > 0, "Amount must be > 0");
        require(seller != address(0), "Invalid seller");
        require(agreements[agreementId].status == EscrowStatus.NONE, "Agreement already exists");

        agreements[agreementId] = AgreementEscrow({
            buyer: msg.sender,
            seller: seller,
            token: address(0),
            amount: msg.value,
            status: EscrowStatus.DEPOSITED,
            createdAt: block.timestamp
        });

        emit Deposited(agreementId, msg.sender, seller, address(0), msg.value);
    }

    /**
     * @notice Deposit ERC-20 stablecoins (USA₮, cUSD, cNGN, USDC) into escrow
     */
    function depositToken(bytes32 agreementId, address seller, address token, uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(seller != address(0) && token != address(0), "Invalid parameters");
        require(agreements[agreementId].status == EscrowStatus.NONE, "Agreement already exists");

        agreements[agreementId] = AgreementEscrow({
            buyer: msg.sender,
            seller: seller,
            token: token,
            amount: amount,
            status: EscrowStatus.DEPOSITED,
            createdAt: block.timestamp
        });

        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        emit Deposited(agreementId, msg.sender, seller, token, amount);
    }

    /**
     * @notice Release escrowed funds to the seller once POKA Sentinel confirms condition satisfaction
     */
    function release(bytes32 agreementId) external onlyAuthorized(agreementId) {
        AgreementEscrow storage esc = agreements[agreementId];
        require(esc.status == EscrowStatus.DEPOSITED, "Not in deposited state");

        esc.status = EscrowStatus.SETTLED;
        uint256 amount = esc.amount;
        address seller = esc.seller;

        if (esc.token == address(0)) {
            (bool success, ) = seller.call{value: amount}("");
            require(success, "Native transfer failed");
        } else {
            require(IERC20(esc.token).transfer(seller, amount), "Token transfer failed");
        }

        emit Settled(agreementId, seller, amount);
    }

    /**
     * @notice Refund escrowed funds to the buyer if condition was failed or canceled
     */
    function refund(bytes32 agreementId) external onlyAuthorized(agreementId) {
        AgreementEscrow storage esc = agreements[agreementId];
        require(esc.status == EscrowStatus.DEPOSITED, "Not in deposited state");

        esc.status = EscrowStatus.REFUNDED;
        uint256 amount = esc.amount;
        address buyer = esc.buyer;

        if (esc.token == address(0)) {
            (bool success, ) = buyer.call{value: amount}("");
            require(success, "Native transfer failed");
        } else {
            require(IERC20(esc.token).transfer(buyer, amount), "Token transfer failed");
        }

        emit Refunded(agreementId, buyer, amount);
    }

    function getAgreement(bytes32 agreementId) external view returns (AgreementEscrow memory) {
        return agreements[agreementId];
    }

    receive() external payable {}
}
