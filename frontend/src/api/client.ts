import type { BoardState } from '../types';

const API_BASE = 'http://localhost:8080/api';

interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    error?: string;
    data?: T;
    user?: { user_id: string; username: string };
}

export const api = {
    /**
     * Register a new user with a login ID, display username and password.
     */
    async register(userId: string, username: string, password: string): Promise<ApiResponse> {
        const res = await fetch(`${API_BASE}/auth.php?action=register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, username, password })
        });
        return res.json();
    },

    /**
     * Authenticate a user by login user ID and password.
     */
    async login(userId: string, password: string): Promise<ApiResponse> {
        const res = await fetch(`${API_BASE}/auth.php?action=login`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, password })
        });
        return res.json();
    },

    /**
     * End the current server-side session.
     */
    async logout(): Promise<ApiResponse> {
        const res = await fetch(`${API_BASE}/auth.php?action=logout`, {
            method: 'POST',
            credentials: 'include'
        });
        return res.json();
    },

    /**
     * Update editable user profile fields for the current session.
     */
    async updateProfile(username: string, currentPassword: string, newPassword: string): Promise<ApiResponse> {
        const res = await fetch(`${API_BASE}/auth.php?action=update_profile`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                current_password: currentPassword,
                new_password: newPassword
            })
        });
        return res.json();
    },

    /**
     * Save kifu metadata, move text and the starting board.
     */
    async saveKifu(
        kifuName: string,
        csaText: string,
        isPublic: boolean,
        kifuId?: number,
        senteName: string = '先手',
        goteName: string = '後手',
        initialBoard?: BoardState
    ): Promise<ApiResponse<{ kifu_id: number }>> {
        const res = await fetch(`${API_BASE}/kifu.php?action=save`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: kifuId,
                title: kifuName,
                kifu_text: csaText,
                is_public: isPublic,
                sente_name: senteName,
                gote_name: goteName,
                initial_board: initialBoard
            })
        });
        return res.json();
    },

    /**
     * Fetch visible kifu list metadata.
     */
    async listKifu(): Promise<ApiResponse<Array<{ kifu_id: number; kifu_name: string; user_id: string | number; username?: string; created: string; sente_name?: string; gote_name?: string }>>> {
        const res = await fetch(`${API_BASE}/kifu.php?action=list`, {
            credentials: 'include'
        });
        return res.json();
    },

    /**
     * Fetch one kifu, including its optional starting board.
     */
    async getKifu(kifuId: number): Promise<ApiResponse<{ kifu_text: string; is_public: boolean; initial_board?: BoardState; sente_name?: string; gote_name?: string }>> {
        const res = await fetch(`${API_BASE}/kifu.php?action=get&id=${kifuId}`, {
            credentials: 'include'
        });
        return res.json();
    },

    /**
     * Delete a kifu owned by the current user.
     */
    async deleteKifu(kifuId: number): Promise<ApiResponse> {
        const res = await fetch(`${API_BASE}/kifu.php?action=delete`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: kifuId })
        });
        return res.json();
    }
};
