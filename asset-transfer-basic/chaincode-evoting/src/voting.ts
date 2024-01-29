/*
 * SPDX-License-Identifier: Apache-2.0
 */
import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import Long from 'long';
import { Timestamp } from 'fabric-shim';
import { Option } from './option';
import { HistoryRecord } from './historyRecord';
import { error } from 'console';


@Info({title: 'Voting Contract', description: 'Smart contract for e-voting'})
export class VotingContract extends Contract {

    @Transaction()
    public async initLedger(ctx: Context): Promise<void> {
        const options: Option[] = [
            {
                id: 'option1',
                name: 'Rom',
                votes: 0,
          
            },
            {
                id: 'option2',
                name: 'Singapur',
                votes: 0,
          
            },
            {
                id: 'option3',
                name: 'Miami',
                votes: 0,
          
            },
        ];

        for (const option of options) {
            option.docType = 'option';
            // example of how to write to world state deterministically
            // use convetion of alphabetic order
            // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
            // when retrieving data, in any lang, the order of data will be the same and consequently also the corresonding hash
            await ctx.stub.putState(option.id, Buffer.from(stringify(sortKeysRecursive(option))));
            console.info(`Option with ID ${option.id} initialized`);
        }
    }

    // CreateOption issues a new voting option to the world state with given details.
    @Transaction()
    public async createOption(ctx: Context, id: string, name: string): Promise<void> {
        const exists = await this.optionExists(ctx, id);
        if (exists) {
            throw new Error(`Option with ID ${id} already exists`);
        }

        const option: Option = {
            docType: 'option',
            id: id,
            name: name,
            votes: 0,
        };
        // Insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(option))));
    }

    // Returns the voting option stored in the world state with given id.
    @Transaction(false)
    @Returns('string')
    public async getOption(ctx: Context, id: string): Promise<string> {
        const option = await ctx.stub.getState(id); // Get the option from chaincode state
        if (!option || option.length === 0) {
            throw new Error(`Option with ID ${id} does not exist`);
        }
        return option.toString();
    }

    // Returns all options found in the world state.
    @Transaction(false)
    @Returns('string')
    public async getAllOptions(ctx: Context): Promise<string> {
        // Range query with empty string for startKey and endKey does an open-ended query of all options in the chaincode namespace.
        const iterator = ctx.stub.getStateByRange('', '');
        const allResults: Option[] = [];
        for await (const result of iterator) {
            const valueString = Buffer.from(result.value).toString('utf8');
            let record: Option = JSON.parse(valueString);
            allResults.push(record);
        }
        return JSON.stringify(allResults);
    }

    // When voting for a specified option, voteCount should be increased by 1
    @Transaction()
    public async castVote(ctx: Context, id: string): Promise<string> {
        const optionString = await this.getOption(ctx, id);
        const option: Option = JSON.parse(optionString);
        option.votes += 1;
        // insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(option))));
        return ctx.stub.getTxID();
    }

    // DeleteOption deletes an given voting option from the world state.
    @Transaction()
    public async deleteOption(ctx: Context, id: string): Promise<void> {
        const exists = await this.optionExists(ctx, id);
        if (!exists) {
            throw new Error(`Option with ID ${id} does not exist`);
        }
        await ctx.stub.deleteState(id);
    }

    // Delete all options found in the world state.
    @Transaction()
    public async deleteAllOptions(ctx: Context): Promise<void> { 
        // Range query with empty string for startKey and endKey does open-ended query of all options in the chaincode namespace.
        const iterator = ctx.stub.getStateByRange('', '');
        for await (const result of iterator) {
            const valueString = Buffer.from(result.value.toString()).toString('utf8');
            let option: Option = JSON.parse(valueString);
            await ctx.stub.deleteState(option.id);
        }
    }

    // Get the recorded history of an Option
    @Transaction(false)
    @Returns('string')
    public async getHistory(ctx: Context, id: string): Promise<string> {
        const iterator = ctx.stub.getHistoryForKey(id);
        const records: HistoryRecord[] = [];
        for await (const result of iterator) {
            const utcDateTimeString = this.convertTimestampToSystemTime(result.timestamp);
            
            if (result.isDelete) {
                const historyRecordDeleted: HistoryRecord = {
                    name: 'DELETED',
                    votes: 'DELETED',
                    timestamp: utcDateTimeString,
                    txId: result.txId,
                };
                records.push(historyRecordDeleted);
            } else {
                const valueString = Buffer.from(result.value.toString()).toString('utf8');
                let option: Option = JSON.parse(valueString);
                const historyRecordNotDeleted: HistoryRecord = {
                    name: option.name,
                    votes: option.votes,
                    timestamp: utcDateTimeString,
                    txId: result.txId,
                };
                records.push(historyRecordNotDeleted);
            }
        }
        return JSON.stringify(records);
    }

    // Returns true when an option with a given ID exists in world state.
    //@Transaction(false)
    //@Returns('boolean')
    private async optionExists(ctx: Context, id: string): Promise<boolean> {
        const option = await ctx.stub.getState(id); 
        return option && option.length > 0;
    }

    // Coverts Unix Epoch timestamp into readable UTC format
    private convertTimestampToSystemTime(timestamp: Timestamp): string {
        // Convert seconds and nanoseconds to milliseconds
        const milliseconds = Long.fromValue(timestamp.seconds).multiply(1000).add(Math.floor(timestamp.nanos / 1e6));
        const date = new Date(milliseconds.toNumber());    
        return date.toString()
    }
}