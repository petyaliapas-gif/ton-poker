export async function upsertUserFromInitData(db, tgUser, countryCode) {
    const data = {
        telegramId: BigInt(tgUser.id),
        username: tgUser.username ?? null,
        firstName: tgUser.first_name,
        lastName: tgUser.last_name ?? null,
        languageCode: tgUser.language_code ?? null,
        isBot: tgUser.is_bot ?? false,
        isPremium: tgUser.is_premium ?? false,
        avatarUrl: tgUser.photo_url ?? null,
        ...(countryCode ? { countryCode } : {}),
    };
    return db.user.upsert({
        where: { telegramId: data.telegramId },
        create: data,
        update: {
            username: data.username,
            firstName: data.firstName,
            lastName: data.lastName,
            languageCode: data.languageCode,
            isPremium: data.isPremium,
            avatarUrl: data.avatarUrl,
        },
    });
}
export function toPublic(u) {
    return {
        id: u.id,
        telegramId: Number(u.telegramId),
        username: u.username,
        firstName: u.firstName,
        avatarUrl: u.avatarUrl,
        vipUntil: u.vipUntil ? u.vipUntil.getTime() : null,
    };
}
//# sourceMappingURL=users.js.map