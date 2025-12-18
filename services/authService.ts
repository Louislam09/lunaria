import { pb } from './pocketbase';

export interface LoginError {
  message: string;
  code?: string;
}

export async function loginWithEmail(email: string, password: string) {
  try {
    const authData = await pb.collection('users').authWithPassword(email, password);
    return authData;
  } catch (error: any) {
    // Map PocketBase errors to user-friendly messages
    if (error.status === 400) {
      throw new Error('Email o contraseña incorrectos');
    }
    throw new Error(error.message || 'Error al iniciar sesión');
  }
}

export async function loginWithGoogle() {
  try {
    const authData = await pb.collection('users').authWithOAuth2({ provider: 'google' });
    return authData;
  } catch (error: any) {
    throw new Error(error.message || 'Error al iniciar sesión con Google');
  }
}

export async function logout() {
  pb.authStore.clear();
}

