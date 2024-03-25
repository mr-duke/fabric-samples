/*
  SPDX-License-Identifier: Apache-2.0

  Saves all the voters who already cast their vote in order to prevent multiple voting
*/

import {Object, Property} from 'fabric-contract-api';

@Object()
export class VoterMonitor {

  @Property()
  public key: string; 

  @Property()
  public alreadyVoted: string[];
}