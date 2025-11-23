/**
 * Token Manager for JWT handling
 */
export class TokenManager {
  private static TOKEN_KEY = 'authToken';

  /**
   * Get token from localStorage
   */
  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Set token in localStorage
   */
  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Remove token from localStorage
   */
  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Check if token exists
   */
  static hasToken(): boolean {
    return !!this.getToken();
  }

  /**
   * Validate JWT token structure and expiration
   */
  static isValidToken(token: string): boolean {
    if (!token) return false;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      const payload = JSON.parse(atob(parts[1]));
      
      // Check expiration
      if (payload.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp > currentTime;
      }

      return true;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }

  /**
   * Get token payload
   */
  static getTokenPayload(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      return JSON.parse(atob(parts[1]));
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  }

  /**
   * Check if current token is valid
   */
  static isCurrentTokenValid(): boolean {
    const token = this.getToken();
    return token ? this.isValidToken(token) : false;
  }
}
