/**
 * Adjust a user's TON balance atomically.
 * Throws if the user doesn't have enough available balance for a debit.
 */
export async function adjustBalance(db, userId, deltaNano, tx) {
    const client = (tx ?? db);
    const user = await client.user.findUniqueOrThrow({
        where: { id: userId },
        select: { balanceTon: true },
    });
    const newBalance = user.balanceTon + deltaNano;
    if (newBalance < 0n)
        throw new Error('Insufficient balance');
    await client.user.update({
        where: { id: userId },
        data: { balanceTon: newBalance },
    });
}
/**
 * Move chips between available and locked.
 * `delta > 0` locks chips for a table; `delta < 0` returns chips.
 */
export async function lockBalance(db, userId, deltaNano) {
    await db.$transaction(async (tx) => {
        const user = await tx.user.findUniqueOrThrow({
            where: { id: userId },
            select: { balanceTon: true, lockedTon: true },
        });
        if (deltaNano > 0n && user.balanceTon < deltaNano)
            throw new Error('Insufficient balance');
        if (deltaNano < 0n && user.lockedTon < -deltaNano)
            throw new Error('Insufficient locked');
        await tx.user.update({
            where: { id: userId },
            data: {
                balanceTon: user.balanceTon - deltaNano,
                lockedTon: user.lockedTon + deltaNano,
            },
        });
    });
}
//# sourceMappingURL=balance.js.map