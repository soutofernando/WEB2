import rateLimit from "express-rate-limit";

const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000; // 15 minutos
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX) || 100; // 100 requisições por janela

export const apiRateLimiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX,
    message: {
        message: "Muitas requisições. Tente novamente mais tarde."
    },
    standardHeaders: true,
    legacyHeaders: false
});

export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        message: "Muitas tentativas de login/registro. Tente novamente em 15 minutos."
    },
    standardHeaders: true,
    legacyHeaders: false
});
