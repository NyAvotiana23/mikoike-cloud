import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('../../httpClient', () => ({ default: { get: vi.fn(), post: vi.fn() } }));

import api from '../../httpClient';
import authService from '../authService';

const httpError = (status, message) => ({ response: { status, data: { message } } });

describe('authService', () => {
    beforeEach(() => vi.resetAllMocks());

    test('login mappe la réponse backend vers {user, sessionId}', async () => {
        api.post.mockResolvedValue({
            data: { userId: 1, email: 'a@b.mg', name: 'Admin', role: 'MANAGER', token: 'tok' },
        });

        const result = await authService.login('a@b.mg', 'pw');

        expect(api.post).toHaveBeenCalledWith('/admin/login', { email: 'a@b.mg', password: 'pw' });
        expect(result).toEqual({
            user: { id: 1, email: 'a@b.mg', name: 'Admin', role: 'MANAGER' },
            sessionId: 'tok',
        });
    });

    test('login 401 sans message → message par défaut', async () => {
        api.post.mockRejectedValue(httpError(401));
        await expect(authService.login('a', 'b')).rejects.toThrow('Email ou mot de passe incorrect');
    });

    test('login 429 → message de trop nombreuses tentatives', async () => {
        api.post.mockRejectedValue(httpError(429));
        await expect(authService.login('a', 'b')).rejects.toThrow('Trop de tentatives');
    });

    test('verifySession renvoie false si le backend refuse', async () => {
        api.get.mockRejectedValue(httpError(401));
        expect(await authService.verifySession('tok')).toBe(false);
    });

    test('verifySession envoie le jeton en Bearer', async () => {
        api.get.mockResolvedValue({ data: { valid: true } });

        expect(await authService.verifySession('tok')).toBe(true);
        expect(api.get).toHaveBeenCalledWith('/auth/validate', { headers: { Authorization: 'Bearer tok' } });
    });
});
