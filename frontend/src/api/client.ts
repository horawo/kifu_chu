const API_BASE = 'http://localhost:8080/api';

interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    user?: { user_id: string; username: string };
}

export const api = {
    // 認証
    async register(username: string, password: string): Promise<ApiResponse> {
        const res = await fetch(`${API_BASE}/auth.php?action=register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        return res.json();
    },

    async login(username: string, password: string): Promise<ApiResponse> {
        const res = await fetch(`${API_BASE}/auth.php?action=login`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        return res.json();
    },

    async logout(): Promise<ApiResponse> {
        const res = await fetch(`${API_BASE}/auth.php?action=logout`, {
            method: 'POST',
            credentials: 'include'
        });
        return res.json();
    },

    // 棋譜
    async saveKifu(kifuName: string, csaText: string, isPublic: boolean, kifuId?: number, senteName: string = '先手', goteName: string = '後手'): Promise<ApiResponse<{ kifu_id: number }>> {
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
                gote_name: goteName
            })
        });
        return res.json();
    },

    async listKifu(): Promise<ApiResponse<Array<{ kifu_id: number; kifu_name: string; created: string; sente_name?: string; gote_name?: string }>>> {
        const res = await fetch(`${API_BASE}/kifu.php?action=list`, {
            credentials: 'include'
        });
        return res.json();
    },

    async getKifu(kifuId: number): Promise<ApiResponse<{ kifu_text: string; is_public: boolean; sente_name?: string; gote_name?: string }>> {
        const res = await fetch(`${API_BASE}/kifu.php?action=get&id=${kifuId}`, {
            credentials: 'include'
        });
        return res.json();
    },

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
