import { CONFIG } from '../constants/config.js';

export class StorageService {
    static get() {
        return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY)) || [];
    }

    static save(data) {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
    }

    static clear() {
        localStorage.removeItem(CONFIG.STORAGE_KEY);
    }
}