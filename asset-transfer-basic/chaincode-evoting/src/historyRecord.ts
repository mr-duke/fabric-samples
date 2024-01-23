/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';

@Object()
export class HistoryRecord {
    @Property()
    public name: string;

    @Property()
    public votes: number;
    
    @Property()
    public timestamp: string;
    
    @Property()
    public txId: string;
    
    @Property()
    public isDeleted: boolean
}