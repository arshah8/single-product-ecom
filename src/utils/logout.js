import { mutate } from 'swr';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { api, clearGuestSessionId } from '../services/api';

export async function performLogout() {
    try {
        await api.logout();
    } catch {
    }

    useCartStore.getState().clearCart();

    useWishlistStore.getState().clearWishlists();

    clearGuestSessionId();

    mutate(
        () => true, // Match all keys
        undefined, // Set to undefined to clear
        { revalidate: false } // Don't revalidate
    );

    useAuthStore.getState().logout();
}