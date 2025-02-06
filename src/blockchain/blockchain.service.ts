import { Injectable } from '@nestjs/common';
import { customData } from 'src/bank/entities/bank.entity';
import * as web3 from 'web3'
import { ethers, JsonRpcProvider } from "ethers";
import * as jsonManager from './abis/Manager.json';
import * as jsonWhitelist from './abis/WhiteList.json';
@Injectable()
export class BlockchainService {
    private web3:web3.Web3;
    private contractManagerAddress: string;
    private abiManager = jsonManager;
    private abiWhitelist = jsonWhitelist;
    private customHttpProvider: JsonRpcProvider;
    // private nonce: number = 0;
    constructor() {
        this.web3 = new web3.Web3(new web3.Web3.providers.HttpProvider(process.env.RPC_PROVIDER));
        this.customHttpProvider = new ethers.JsonRpcProvider(process.env.RPC_PROVIDER);
        this.contractManagerAddress = process.env.ADDRESS_MANAGER;
    }
    async getFee(){
        const baseFee: number = await this.web3.eth.getBlock().then((block: any) => { 
            return Number(block.baseFeePerGas) + 400000000000; 
          });
        return baseFee;
    }

    async mintToken(account:web3.eth.accounts.Web3Account, customData: customData, isExternal: boolean = false){
        // if(this.nonce == 0){
        //     this.nonce = await this.customHttpProvider.getTransactionCount(account.address);
        // }
        const fee = await this.getFee();
        const signer = new ethers.Wallet(account.privateKey, this.customHttpProvider);
        const contract = new ethers.Contract(this.contractManagerAddress, this.abiManager.abi, signer);
        const maxFeePerGas = this.web3.utils.toHex(fee)
        // const maxPriorityFeePerGas = this.web3.utils.toHex(this.web3.utils.toWei('40', 'gwei'));
        const maxPriorityFeePerGas = ethers.parseUnits('100','gwei');
        const amount = this.formatToWei(customData.tokenQuantity);
        if(isExternal){
            const tx = await contract.buyWithoutPay(amount,customData.wallet,customData.sellerAddress,{
                maxFeePerGas, 
                maxPriorityFeePerGas,
                // nonce:this.nonce
            })
            // this.nonce++;
            return await tx.wait();   
        }
        const tx = await contract.buyThroughCompany(amount,customData.wallet,customData.sellerAddress,{
            maxFeePerGas, 
            maxPriorityFeePerGas,
            // nonce:this.nonce
        })
        // this.nonce++;
        return await tx.wait();
    }

    async mintTokenV2(account:web3.eth.accounts.Web3Account, customData:{wallet:string,sellerAddress:string, tokenQuantity:number}, isExternal: boolean = false){
        const fee = await this.getFee();
        const signer = new ethers.Wallet(account.privateKey, this.customHttpProvider);
        const contract = new ethers.Contract(this.contractManagerAddress, this.abiManager.abi, signer);
        const maxFeePerGas = this.web3.utils.toHex(fee)
        // const maxPriorityFeePerGas = this.web3.utils.toHex(this.web3.utils.toWei('40', 'gwei'));
        const maxPriorityFeePerGas = ethers.parseUnits('50','gwei');
        const amount = this.formatToWei(customData.tokenQuantity);
        if(isExternal){
            const tx = await contract.buyWithoutPay(amount,customData.wallet,customData.sellerAddress,{
                maxFeePerGas, 
                maxPriorityFeePerGas
            })
            return await tx.wait();   
        }
        const tx = await contract.buyThroughCompany(amount,customData.wallet,customData.sellerAddress,{
            maxFeePerGas, 
            maxPriorityFeePerGas
        })
        return await tx.wait();
    }

    async registerBlockchainWallet(account:web3.eth.accounts.Web3Account, wallet:string){
        const fee = await this.getFee();
        const signer = new ethers.Wallet(account.privateKey, this.customHttpProvider);
        const contract = new ethers.Contract(this.contractManagerAddress, this.abiManager.abi, signer);
        const maxFeePerGas = this.web3.utils.toHex(fee)
        // const maxPriorityFeePerGas = this.web3.utils.toHex(this.web3.utils.toWei('40', 'gwei'));
        const maxPriorityFeePerGas = ethers.parseUnits('50','gwei');
        const tx = await contract.setStatusWhiteList(wallet,1,{
            maxFeePerGas, 
            maxPriorityFeePerGas
        })
        return await tx.wait();
    }

    async getWalletStatus(wallet:string){
        const contract = new ethers.Contract('0xd5Ea5c8327099D70dF461Ee71318b2AcD1CB5433', this.abiWhitelist.abi,this.customHttpProvider);    
        const data = await contract.status(wallet);  
        return Number(data.toString());  
    }

    async getWalletBalance(wallet: string) {
        const contract = new ethers.Contract(this.contractManagerAddress, this.abiManager.abi, this.customHttpProvider);
        const balance = await contract.balanceOf(wallet);
        return this.web3.utils.fromWei(balance.toString(), 'ether');
    }

    async decryptSecret(secretData:any){
        return await web3.eth.accounts.decrypt(secretData.secret,process.env.SECRET_KEY_PASSWORD);
    }
    formatToWei(num: number) {
        return this.web3.utils.toWei(num.toString(), 'ether');
      }
}
