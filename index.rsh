'reach 0.1';

export const main = Reach.App(() => {
    const Alice = Participant('Alice', {
        Timeout: Fun([UInt], Null),
        amt: UInt,
        end: UInt,
        Aliceswitch: Fun([], Bool)
    })
    const Bob = Participant('Bob', {
        Timeout: Fun([UInt], Null),
        Accept_terms: Fun([UInt], Bool),
    })

    init()
    Alice.only(() => {
        const amt = declassify(interact.amt)
        const end = declassify(interact.end)
    })
    Alice.publish(amt, end)
    commit()

    Bob.only(() => {
        const terms = declassify(interact.Accept_terms(amt))
    })
    Bob.publish(terms)
    commit()
    Alice.pay(amt)
    commit()
    Alice.publish()
    if (terms) {
        const endvalue = lastConsensusTime() + end
        var [status, deadline] = [false, end]
        invariant(balance() == amt)
        while (lastConsensusTime() <= endvalue) {
            commit()
            Alice.only(() => {
                const Alicestatus = declassify(interact.Aliceswitch())
            })
            Alice.publish(Alicestatus)
            commit()
            Alice.only(() => {
                interact.Timeout(deadline)
            })
            Alice.publish()
            commit()
            Bob.only(() => {
                interact.Timeout(deadline)
            })
            Bob.publish()
            if (terms) {
                [status, deadline] = [Alicestatus, deadline - 1]
                continue
            } else {
                status = true
                continue
            }

        }
        if (status) {
            transfer(amt).to(Alice)
        } else {
            transfer(amt).to(Bob)
        }

    } else {
        transfer(amt).to(Alice)
    }


    commit()

});
