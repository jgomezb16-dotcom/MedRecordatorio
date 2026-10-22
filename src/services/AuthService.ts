import { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export class AuthService {
  async registrar(email: string, password: string): Promise<Session | null> {
    this.validar(email, password);

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      throw new Error(this.traducirError(error.message));
    }
    return data.session;
  }

  async iniciarSesion(email: string, password: string): Promise<void> {
    this.validar(email, password);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw new Error(this.traducirError(error.message));
    }
  }

  async cerrarSesion(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(this.traducirError(error.message));
    }
  }

  async obtenerSesion(): Promise<Session | null> {
    const { data } = await supabase.auth.getSession();
    return data.session;
  }

  escucharCambios(callback: (session: Session | null) => void): () => void {
    const { data } = supabase.auth.onAuthStateChange((_evento, session) => {
      callback(session);
    });
    return () => data.subscription.unsubscribe();
  }

  private validar(email: string, password: string): void {
    if (!email.trim() || !password) {
      throw new Error("Ingresa tu correo y contraseña.");
    }
    if (password.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres.");
    }
  }

  private traducirError(mensaje: string): string {
    if (mensaje.includes("Invalid login credentials")) {
      return "Correo o contraseña incorrectos.";
    }
    if (mensaje.includes("already registered")) {
      return "Ya existe una cuenta con ese correo.";
    }
    return mensaje;
  }
}