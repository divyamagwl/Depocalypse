import { web3 } from "./web3";

export const getPriceFeed = async () => {
    const network = await web3.eth.net.getId();
    // localhost network 
    if(network === 5777) {
        return 1.14985132; // MATIC TO USD 
    }
    try {
        const aggregatorV3InterfaceABI = [{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"description","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint80","name":"_roundId","type":"uint80"}],"name":"getRoundData","outputs":[{"internalType":"uint80","name":"roundId","type":"uint80"},{"internalType":"int256","name":"answer","type":"int256"},{"internalType":"uint256","name":"startedAt","type":"uint256"},{"internalType":"uint256","name":"updatedAt","type":"uint256"},{"internalType":"uint80","name":"answeredInRound","type":"uint80"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"latestRoundData","outputs":[{"internalType":"uint80","name":"roundId","type":"uint80"},{"internalType":"int256","name":"answer","type":"int256"},{"internalType":"uint256","name":"startedAt","type":"uint256"},{"internalType":"uint256","name":"updatedAt","type":"uint256"},{"internalType":"uint80","name":"answeredInRound","type":"uint80"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"version","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}];
        const addr = "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada";
        const priceFeed = new web3.eth.Contract(aggregatorV3InterfaceABI, addr);
        priceFeed.methods.latestRoundData().call()
        .then((roundData) => {
            const roundPrice = roundData.answer/10**8
            console.log(roundPrice);
            return roundPrice;
        })
    }
    catch (e) {
        console.log(e);
    }
    return 1.14985132; // MATIC TO USD 
}