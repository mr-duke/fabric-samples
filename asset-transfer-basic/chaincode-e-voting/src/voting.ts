/*
 * SPDX-License-Identifier: Apache-2.0
 */
// Deterministic JSON.stringify()
import {Context, Contract, Info, Returns, Transaction, ChaincodeStub } from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import {Option} from './option';

@Info({title: 'Voting Contract', description: 'Smart contract for e-voting'})
export class VotingContract extends Contract {

    @Transaction()
    public async InitLedger(ctx: Context): Promise<void> {
        const options: Option[] = [
            {
                ID: 'option1',
                Name: 'Rom',
                VoteCount: 0,
          
            },
            {
                ID: 'option2',
                Name: 'Singapur',
                VoteCount: 0,
          
            },
            {
                ID: 'option3',
                Name: 'Miami',
                VoteCount: 0,
          
            },
        ];

        for (const option of options) {
            option.docType = 'option';
            // example of how to write to world state deterministically
            // use convetion of alphabetic order
            // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
            // when retrieving data, in any lang, the order of data will be the same and consequently also the corresonding hash
            await ctx.stub.putState(option.ID, Buffer.from(stringify(sortKeysRecursive(option))));
            console.info(`Option with ID ${option.ID} initialized`);
        }
    }

    // CreateOption issues a new voting option to the world state with given details.
    @Transaction()
    public async CreateOption(ctx: Context, id: string, name: string): Promise<void> {
        const exists = await this.optionExists(ctx, id);
        if (exists) {
            throw new Error(`Option with ID ${id} already exists`);
        }

        const option = {
            ID: id,
            Name: name,
            VoteCount: 0,
        };
        // Insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(option))));
    }

    // ReadOption returns the voting option stored in the world state with given id.
    @Transaction(false)
    public async ReadOption(ctx: Context, id: string): Promise<string> {
        const optionJSON = await ctx.stub.getState(id); // Get the option from chaincode state
        if (!optionJSON || optionJSON.length === 0) {
            throw new Error(`Option with ID ${id} does not exist`);
        }
        return optionJSON.toString();
    }

    // When voting for a specified option, voteCount should be increased by 1
    @Transaction()
    public async CastVote(ctx: Context, id: string): Promise<void> {
        const optionString = await this.ReadOption(ctx, id);
        const option = JSON.parse(optionString);
        option.VoteCount += 1;
        // insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(option))));
    }

    /* Updateballot updates an existing ballot in the world state with provided parameters.
    @Transaction()
    public async Updateballot(ctx: Context, id: string, color: string, size: number, owner: string, appraisedValue: number): Promise<void> {
        const exists = await this.ballotExists(ctx, id);
        if (!exists) {
            throw new Error(`The ballot ${id} does not exist`);
        }

        // overwriting original ballot with new ballot
        const updatedballot = {
            ID: id,
            Color: color,
            Size: size,
            Owner: owner,
            AppraisedValue: appraisedValue,
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        return ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(updatedballot))));
    }
    */

    // DeleteOption deletes an given voting option from the world state.
    @Transaction()
    public async DeleteOption(ctx: Context, id: string): Promise<void> {
        const exists = await this.optionExists(ctx, id);
        if (!exists) {
            throw new Error(`Option with ID ${id} does not exist`);
        }
        return ctx.stub.deleteState(id);
    }

    // optionExists returns true when an option with a given ID exists in world state.
    @Transaction(false)
    @Returns('boolean')
    public async optionExists(ctx: Context, id: string): Promise<boolean> {
        const optionJSON = await ctx.stub.getState(id);
        return optionJSON && optionJSON.length > 0;
    }

    /* Transferballot updates the owner field of ballot with given id in the world state, and returns the old owner.
    @Transaction()
    public async Transferballot(ctx: Context, id: string, newOwner: string): Promise<string> {
        const ballotString = await this.Readballot(ctx, id);
        const ballot = JSON.parse(ballotString);
        const oldOwner = ballot.Owner;
        ballot.Owner = newOwner;
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(ballot))));
        return oldOwner;
    }
    */

    // GetAllOptions returns all options found in the world state.
    @Transaction(false)
    @Returns('string')
    public async GetAllOptions(ctx: Context): Promise<string> {
        const allResults = [];
        // Range query with empty string for startKey and endKey does an open-ended query of all options in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

    @Transaction(false)
    @Returns('string')
    public async GetHistory(ctx: Context, id: string): Promise<string> {
        const iter =  ctx.stub.getHistoryForKey(id);

        const allResults = [];
        for await (const res of iter) {
            const record = {
                timestamp: res.timestamp,
                txId: res.txId,
                isDelete: res.isDelete,
                value: res.value.toString(),
            };
            allResults.push(record);
        }
        return JSON.stringify(allResults);
    }
}
