/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';

@Object()
export class Option {
    @Property()
    public docType?: string;

    @Property()
    public key: string;

    @Property()
    public name: string;

    @Property()
    public votes: number;
}
