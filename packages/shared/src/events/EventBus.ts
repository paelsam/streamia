/**
 * EventBus for communication between microfrontends
 * Provides pub/sub pattern for cross-MFE communication
 */

type EventCallback = (data: any) => void;

export class EventBus {
  private events: Map<string, EventCallback[]> = new Map();

  /**
   * Subscribe to an event
   * @param event Event name
   * @param callback Callback function
   * @returns Unsubscribe function
   */
  subscribe(event: string, callback: EventCallback): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
    
    console.log(`[EventBus] Subscribed to "${event}"`, { 
      totalSubscribers: this.events.get(event)!.length 
    });

    // Return cleanup function
    return () => {
      const callbacks = this.events.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
          console.log(`[EventBus] Unsubscribed from "${event}"`, { 
            remainingSubscribers: callbacks.length 
          });
        }
      }
    };
  }

  /**
   * Publish an event
   * @param event Event name
   * @param data Event data
   */
   publish(event: string, data?: any): void {
    const callbacks = this.events.get(event);
    console.log(`[EventBus] Publishing "${event}"`, { 
      subscriberCount: callbacks?.length || 0,
      data: data ? (data.token ? { ...data, token: '***' } : data) : undefined
    });
    
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[EventBus] Error in event callback for "${event}":`, error);
        }
      });
    } else {
      console.warn(`[EventBus] No subscribers for event "${event}"`);
    }
  }

  /**
   * Unsubscribe all callbacks for an event
   * @param event Event name
   */
  unsubscribe(event: string): void {
    this.events.delete(event);
  }

  /**
   * Clear all events
   */
  clear(): void {
    this.events.clear();
  }

  /**
   * Get list of registered events
   */
  getEvents(): string[] {
    return Array.from(this.events.keys());
  }
}

// Use a global singleton to ensure all MFEs share the same EventBus instance
declare global {
  interface Window {
    __STREAMIA_EVENT_BUS__?: EventBus;
  }
}

// Create or reuse the global EventBus instance
const getGlobalEventBus = (): EventBus => {
  if (typeof window !== 'undefined') {
    if (!window.__STREAMIA_EVENT_BUS__) {
      window.__STREAMIA_EVENT_BUS__ = new EventBus();
      console.log('[EventBus] Created new global EventBus instance');
    }
    return window.__STREAMIA_EVENT_BUS__;
  }
  // Fallback for SSR or non-browser environments
  return new EventBus();
};

// Singleton instance shared across all MFEs
export const eventBus = getGlobalEventBus();

// Event names constants
export const EVENTS = {
  // Auth events
  USER_LOGIN: 'user:login',
  USER_LOGOUT: 'user:logout',
  USER_UPDATED: 'user:updated',
  USER_DELETED: 'user:deleted',
  
  // Navigation events
  ROUTE_CHANGE: 'route:change',
  
  // Movie events
  MOVIE_SELECTED: 'movie:selected',
  MOVIE_PLAY: 'movie:play',
  FAVORITE_ADDED: 'favorite:added',
  FAVORITE_REMOVED: 'favorite:removed',
  MOVIE_RATED: 'movie:rated',
  COMMENT_ADDED: 'comment:added',
  
  // UI events
  LOADING_START: 'loading:start',
  LOADING_END: 'loading:end',
  ERROR_OCCURRED: 'error:occurred',

  // Comments events
  COMMENT_CREATED: 'comment:created',
  COMMENT_DELETED: 'comment:deleted',
} as const;

export type EventName = typeof EVENTS[keyof typeof EVENTS];
