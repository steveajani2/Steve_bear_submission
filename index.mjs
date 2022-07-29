import { loadStdlib } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
import { ask } from '@reach-sh/stdlib/ask.mjs';

const stdlib = loadStdlib();

const name1 = "Alice"
const name2 = "Bob"

const accAlice = await stdlib.newTestAccount(stdlib.parseCurrency(7000));
const accBob = await stdlib.newTestAccount(stdlib.parseCurrency(1000));

const ctcAlice = accAlice.contract(backend);

const ctcBob = accBob.contract(backend, ctcAlice.getInfo())
console.log(`Hello ${name1} and ${name2}`)
console.log(`The vault game has started`)


const getbalance = async (acc, username) => {
    const bal = await stdlib.balanceOf(acc);
    console.log(`${username} has ${stdlib.formatCurrency(bal)} ${stdlib.standardUnit} tokens`)
}

await getbalance(accAlice, name1)
await getbalance(accBob, name2)
const getamt = await ask(`How much funds are you depositing into the contract ${name1} `)
const deadline = await ask(`${name1} enter the timeout for the contract`)
await Promise.all([
    backend.Alice(ctcAlice, {
        amt: stdlib.parseCurrency(getamt),
        end: parseInt(deadline),
        Aliceswitch: async () => {
            const Status = await ask(`${name1} are you there\nyes or no: `)
            if (Status == "yes") {
                console.log(`${name1} is present `)
                return true
            } else if (Status == "no") {
                console.log(`${name1} is absent`)
                return false
            }
        },
        Timeout: async (num) => {
            console.log(`${name1} the timeout is now ${num} `)
        },

    }),
    backend.Bob(ctcBob, {
        Accept_terms: async (amt) => {
            console.log(`${name2} saw the ${name1} deposit ${stdlib.formatCurrency(amt)} ${stdlib.standardUnit} algo`)
            const agree = await ask(`Do you agree to the terms of the game ${name2}`)
            if (agree == "yes" || agree == "y") {
                console.log(`${name2} agreed to the terms`)
                return true
            } else if (agree == "no" || agree == "n") {
                console.log(`${name2} doesn't agree to the terms`)
                return false
            }
        },
        Timeout: async (num) => {
            console.log(`${name2} the timeout is now ${num} `)
        },
    }),

]);

await getbalance(accAlice, name1)
await getbalance(accBob, name2)
process.exit()
