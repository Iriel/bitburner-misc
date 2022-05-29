/** @param {NS} ns */
export default function threadcounts(ns) {
    const hacking = ns.formulas.hacking

    /** Computes the result of a grow operation.
     *
      *  @param {Number} fromMoney the target server's current money
      *  @param {Server} server the target server object
      *  @param {Number} threads the number of threads to use
      *  @param {Player} player the player object doing the hacking
      *  @param {Number} cores the number of cores on the server executing hack
      *  @return {Number} the amount of money after the grow (NOT limited by maxMoney)
      */
    function computeGrow(fromMoney, server, threads, player, cores) {
        const growForThreads = hacking.growPercent(server, threads, player, cores)
        return (fromMoney + threads) * growForThreads
    }

    /** Determines the minimum number of threads required to achieve a particular
      *  growth goal on a server.
      * 
      *  @param {Number} fromMoney the target's starting money
      *  @param {Number} toMoney the target's desired money
      *  @param {Server} server the target's server object
      *  @param {Player} player the player object doing the hacking
      *  @param {Number} cores the number of cores on the server executing hack
      *  @return {Number} the smallest number of threads required to achieve the goal
      */
    function minThreadsForGrow(fromMoney, toMoney, server, player, cores) {
        if (fromMoney >= toMoney) {
            return 0
        }
        // Can't use less than one thread
        let lowerThreads = 1
        let lowerMoney = computeGrow(fromMoney, server, lowerThreads, player, cores)
        if (lowerMoney >= toMoney) {
            return 1
        }

        // This produces an over-estimate of the number needed (We know it's at least 2 threads though)
        const growForOne = hacking.growPercent(server, 1, player, cores)
        let upperThreads = Math.ceil(Math.log(toMoney / (fromMoney + 2)) / Math.log(growForOne))
        let upperMoney = computeGrow(fromMoney, server, upperThreads, player, cores)

        // Binary search between them
        while (lowerThreads < upperThreads - 1) {
            let midThreads = Math.floor((lowerThreads + upperThreads) / 2)
            if (midThreads == lowerThreads) {
                return upperThreads
            }
            let midMoney = computeGrow(fromMoney, server, midThreads, player, cores)

            if (midMoney == toMoney) {
                return midThreads
            } else if (midMoney < toMoney) {
                lowerThreads = midThreads
                lowerMoney = midMoney
            } else {
                upperThreads = midThreads
                upperMoney = midMoney
            }
        }
        return upperThreads
    }

    /** Determines the minimum number of threads required to achieve a particular
        *  weaken goal on a server.
        * 
        *  @param {Number} fromSecurity the target's starting security level
        *  @param {Number} toSecurity the target's desired security level
        *  @param {Number} cores the number of cores on the server executing hack
        *  @return {Number} the smallest number of threads required to achieve the goal
        */
    function minThreadsForWeaken(fromSecurity, toSecurity, cores) {
        const toWeaken = Math.max(0, fromSecurity - toSecurity)
        if (toWeaken == 0) {
            return 0
        }

        let lowerThreads = 1
        let lowerWeaken = ns.weakenAnalyze(lowerThreads, cores)
        if (lowerWeaken >= toWeaken) {
            return lowerThreads
        }

        const SEEK_MULTIPLIER = 2

        let upperThreads = Math.ceil(toWeaken / lowerWeaken)
        let upperWeaken = 0
        while (upperThreads > 0) {
            upperWeaken = ns.weakenAnalyze(upperThreads, cores)
            if (upperWeaken == toWeaken) {
                return upperThreads
            } if (upperWeaken > toWeaken) {
                break
            } else {
                lowerThreads = upperThreads
                lowerWeaken = upperWeaken
                upperThreads *= SEEK_MULTIPLIER
            }
        }

        if (upperThreads == lowerThreads + 1) {
            return upperThreads
        }

        // In theory we guessed this anyway
        let midThreads = upperThreads - 1
        let midWeaken = ns.weakenAnalyze(midThreads, cores)
        if (midWeaken < toWeaken) {
            return upperThreads
        } else if (midWeaken == toWeaken) {
            return midThreads
        } else {
            upperThreads = midThreads
            upperWeaken = midWeaken
        }

        // Binary search time then
        while (lowerThreads < upperThreads - 1) {
            midThreads = Math.ceil((upperThreads + lowerThreads) / 2)
            midWeaken = ns.weakenAnalyze(midThreads, cores)
            if (midWeaken < toWeaken) {
                lowerThreads = midThreads
                lowerWeaken = midWeaken
            } else if (midWeaken > toWeaken) {
                upperThreads = midThreads
                upperWeaken = midWeaken
            } else {
                return midThreads
            }
        }
        return upperThreads
    }

    /** Computes the result of a hack operation.
     *
      *  @param {Number} fromMoney the target server's current money
      *  @param {Server} server the target server object
      *  @param {Number} threads the number of threads to use
      *  @param {Player} player the player object doing the hacking
      *  @return {Number} the amount of money after the hack
      */
    function computeHack(fromMoney, server, threads, player) {
        const hackPercentOneThread = hacking.hackPercent(server, player)
        return Math.floor(fromMoney * hackPercentOneThread) * threads
    }


    /** Determines the minimum number of threads required to achieve a particular
      *  hack goal on a server.
      * 
      *  @param {Number} fromMoney the target's starting money
      *  @param {Number} toMoney the target's desired money
      *  @param {Server} server the target's server object
      *  @param {Player} player the player object doing the hacking
      *  @return {Number} the smallest number of threads required to achieve the goal
      */
    function minThreadsForHack(fromMoney, toMoney, server, player) {
        const toHack = Math.max(0, fromMoney - toMoney)
        if (toHack == 0) {
            return 0
        }
        const hackPercentOneThread = hacking.hackPercent(server, player)
        const hackAmountOneThread = Math.floor(fromMoney * hackPercentOneThread)
        return Math.ceil(toHack / hackAmountOneThread)
    }

    return {
        'computeGrow' : computeGrow,
        'computeHack' : computeHack,
        'minThreadsForGrow': minThreadsForGrow,
        'minThreadsForWeaken': minThreadsForWeaken,
        'minThreadsForHack': minThreadsForHack,
    }
}