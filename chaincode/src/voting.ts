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
import { VoterMonitor } from './voterMonitor';


@Info({title: 'Voting Contract', description: 'Smart contract for e-voting'})
export class VotingContract extends Contract {

    @Transaction()
    public async initLedger(ctx: Context): Promise<void> {
        const options: Option[] = [
            {
                key: 'rom',
                name: 'Rom',
                votes: 0,
            },
            {
                key: 'barcelona',
                name: 'Barcelona',
                votes: 0,
            },
            {
                key: 'hamburg',
                name: 'Hamburg',
                votes: 0,     
            },
        ];

        for (const option of options) {
            option.docType = 'option';
            // example of how to write to world state deterministically
            // use convetion of alphabetic order
            // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
            // when retrieving data, in any lang, the order of data will be the same and consequently also the corresonding hash
            await ctx.stub.putState(option.key, Buffer.from(stringify(sortKeysRecursive(option))));
            console.log(`Option ${option.name} mit Schlüssel ${option.key} angelegt`);
        }
    }

    // CreateOption issues a new voting option to the world state with given details.
    @Transaction()
    public async createOption(ctx: Context, name: string): Promise<void> {
        // Create key from name and format it
        const formattedKey = this.formatKey(name);
        const exists = await this.optionExists(ctx, formattedKey);
        if (exists) {
            throw new Error(`Option existiert bereits`);
        }

        const option: Option = {
            docType: 'option',
            key: formattedKey,
            name: name,
            votes: 0,
        };
        // Insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(formattedKey, Buffer.from(stringify(sortKeysRecursive(option))));
    }

    // Returns the voting option stored in the world state with given key.
    @Transaction(false)
    @Returns('string')
    public async getOption(ctx: Context, key: string): Promise<string> {
        const formattedKey = this.formatKey(key);
        const option = await ctx.stub.getState(formattedKey); // Get the option from chaincode state
        if (!option || option.length === 0) {
            throw new Error(`Option mit Schlüssel ${formattedKey} existiert nicht`);
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
    // and corresponding TransactionID should be returned
    @Transaction()
    @Returns('string')
    public async castVote(ctx: Context, key: string): Promise<string> {
        const formattedKey = this.formatKey(key);
        const optionString = await this.getOption(ctx, formattedKey);
        const option: Option = JSON.parse(optionString);
        option.votes += 1;
        // insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(formattedKey, Buffer.from(stringify(sortKeysRecursive(option))));
        return ctx.stub.getTxID();
    }

    // Deletes a voting option from the world state.
    @Transaction()
    public async deleteOption(ctx: Context, key: string): Promise<void> {
        const formattedKey = this.formatKey(key);
        const exists = await this.optionExists(ctx, formattedKey);
        if (!exists) {
            throw new Error(`Option mit Schlüssel ${key} existiert nicht`);
        }
        await ctx.stub.deleteState(formattedKey);
    }

    // Delete all options found in the world state.
    @Transaction()
    public async deleteAllOptions(ctx: Context): Promise<void> { 
        // Range query with empty string for startKey and endKey does open-ended query of all options in the chaincode namespace.
        const iterator = ctx.stub.getStateByRange('', '');
        for await (const result of iterator) {
            const valueString = Buffer.from(result.value.toString()).toString('utf8');
            let option: Option = JSON.parse(valueString);
            await ctx.stub.deleteState(option.key);
        }
    }

    // Get the recorded history of an Option
    @Transaction(false)
    @Returns('string')
    public async getHistoryForKey(ctx: Context, key: string): Promise<string> {
        const formattedKey = this.formatKey(key);
        const iterator = ctx.stub.getHistoryForKey(formattedKey);
        const records: HistoryRecord[] = [];
        for await (const result of iterator) {
            const cetDateTimeString = this.convertTimestampToCET(result.timestamp);
            
            if (result.isDelete) {
                const historyRecordDeleted: HistoryRecord = {
                    key: 'GELOESCHT',
                    name: 'GELOESCHT',
                    votes: 'GELOESCHT',
                    timestamp: cetDateTimeString,
                    txId: result.txId,
                };
                records.push(historyRecordDeleted);
            } else {
                const valueString = Buffer.from(result.value.toString()).toString('utf8');
                let option: Option = JSON.parse(valueString);
                const historyRecordNotDeleted: HistoryRecord = {
                    key: option.key,
                    name: option.name,
                    votes: option.votes,
                    timestamp: cetDateTimeString,
                    txId: result.txId,
                };
                records.push(historyRecordNotDeleted);
            }
        }
        return JSON.stringify(records);
    }

    // Add a user to the list of voters who already cast their vote
    // in order to prevent multiple voting
    @Transaction()
    public async addToVoters(ctx: Context, voterName: string): Promise<void> {
        const voterMonitorKey = 'voterMonitor';
        const voterMonitor = await ctx.stub.getState(voterMonitorKey); // Get the option from chaincode state
        
        if (!voterMonitor || voterMonitor.length === 0) {
            const newVoterMonitor = {
                key: voterMonitorKey,
                alreadyVoted: [voterName],
            };
            await ctx.stub.putState(voterMonitorKey, Buffer.from(stringify(sortKeysRecursive(newVoterMonitor))));
        } else {
            const voterMonitorObject: VoterMonitor = JSON.parse(voterMonitor.toString());
            voterMonitorObject.alreadyVoted.push(voterName);
            await ctx.stub.putState(voterMonitorKey, Buffer.from(stringify(sortKeysRecursive(voterMonitorObject))));
        }
    }

    // Return all voters from VoteMonitor who already cast their vote
    @Transaction(false)
    @Returns('string')
    public async getAllVoters(ctx: Context): Promise<string[]> {
        const voterMonitorKey = 'voterMonitor';
        const voterMonitor = await ctx.stub.getState(voterMonitorKey);
        if (!voterMonitor || voterMonitor.length === 0) {
            return [];
        } else {
            const voterMonitorObject: VoterMonitor = JSON.parse(voterMonitor.toString());
            return voterMonitorObject.alreadyVoted;
        }
    }

    // Delete VoteMonitor from world state, including all voters who already cast their vote
    @Transaction()
    public async deleteAllVoters(ctx: Context): Promise<void> {
        const voterMonitorKey = 'voterMonitor';
        await ctx.stub.deleteState(voterMonitorKey);
    }


    // Returns true when an option with a given ID exists in world state.
    private async optionExists(ctx: Context, key: string): Promise<boolean> {
        const formattedKey = this.formatKey(key);
        const option = await ctx.stub.getState(formattedKey); 
        return option && option.length > 0;
    }
    
    // Create key by removing whitespaces and converting to lowercase
    private formatKey(unformattedKey: string): string {
        return unformattedKey.replace(/\s/g, '').toLowerCase();
    }

    // Coverts Unix Epoch timestamp into readable UTC format
    private convertTimestampToCET(timestamp: Timestamp): string {
        // Convert seconds and nanoseconds to milliseconds
        const milliseconds = Long.fromValue(timestamp.seconds).multiply(1000).add(Math.floor(timestamp.nanos / 1e6));
        const date = new Date(milliseconds.toNumber());    
        // Convert to CET (Central European Time)
        const options: Intl.DateTimeFormatOptions = { timeZone: 'Europe/Berlin', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric',  weekday: 'long'};
        return date.toLocaleString('de-DE', options);
    }
}