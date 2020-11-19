const {accounts, contract,web3} = require('@openzeppelin/test-environment');
const {
  BN,          // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

const {expect} = require('chai');

const MintToken = contract.fromArtifact('MintToken'); // Loads a compiled contract

describe('MintToken', function () {
    const [alice, bob, carol] = accounts;

    beforeEach(async () => {
    	this.value = new BN(18);
        this.mintToken = await MintToken.new();
        // this.mintToken.initialize();
        let rolsSha3 = web3.utils.soliditySha3("MINTER_ROLE")
        console.log(rolsSha3)
        this.role =  rolsSha3

    });

    it('should have correct name and symbol and decimal', async () => {
    	// const name = await this.mintToken.name();
     //    const symbol = await this.mintToken.symbol();
     //    const decimals = await this.mintToken.decimals();
     //    assert.equal(name.valueOf(), 'HundredToken');
     //    assert.equal(symbol.valueOf(), 'HUNDRED');
     //    assert.equal(decimals.valueOf(), '18');
    	// assert.equal()
        expect(await this.mintToken.name()).to.equal('Mint Coin');
        expect(await this.mintToken.symbol()).to.equal('MC');
        expect(await this.mintToken.decimals()).to.be.bignumber.equal(this.value);
    });

    it('should only allow owner to mint token', async () => {

        await this.mintToken.grantRole(this.role, alice);
        await this.mintToken.mint(alice, '1000', {from: alice});
        await this.mintToken.mint(bob, '10000', {from: alice});
        await expectRevert(
            this.mintToken.mint(carol, '1000', {from: bob }),
            'Caller is not a minter',
        );
        expect(await this.mintToken.balanceOf(alice)).to.be.bignumber.equal('1000');
        expect(await this.mintToken.balanceOf(bob)).to.be.bignumber.equal('10000');
        expect(await this.mintToken.balanceOf(carol)).to.be.bignumber.equal('0');
        expect(await this.mintToken.totalSupply()).to.be.bignumber.equal('11000');

    });

    it('should supply token transfers properly', async () => {
    	await this.mintToken.grantRole(this.role, alice);
        await this.mintToken.mint(alice, '100', { from: alice });
        await this.mintToken.mint(bob, '1000', { from: alice });
        await this.mintToken.transfer(carol, '10', { from: alice });
        await this.mintToken.transfer(carol, '100', { from: bob });
        const totalSupply = await this.mintToken.totalSupply();
        const aliceBal = await this.mintToken.balanceOf(alice);
        const bobBal = await this.mintToken.balanceOf(bob);
        const carolBal = await this.mintToken.balanceOf(carol);
        expect(totalSupply.valueOf()).to.be.bignumber.equal('1100');
        expect(aliceBal.valueOf()).to.be.bignumber.equal('90');
        expect(bobBal.valueOf()).to.be.bignumber.equal('900');
        expect(carolBal.valueOf()).to.be.bignumber.equal('110');
    });

    it('should fail if you try to do bad transfers', async () => {
    	await this.mintToken.grantRole('0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6', alice);
        await this.mintToken.mint(alice, '100', { from: alice });
        await expectRevert(
            this.mintToken.transfer(carol, '110', { from: alice }),
            'ERC20: transfer amount exceeds balance',
        );
        await expectRevert(
            this.mintToken.transfer(carol, '1', { from: bob }),
            'ERC20: transfer amount exceeds balance',
        );
    });

});


