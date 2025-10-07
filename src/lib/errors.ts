// A simple event emitter
type Listener = (data: any) => void;
class EventEmitter {
  private listeners: { [key: string]: Listener[] } = {};

  on(event: string, listener: Listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(listener => listener(data));
    }
  }
}

export const errorEmitter = new EventEmitter();

export type FirestorePermissionErrorContext = {
    operation: 'get' | 'list' | 'create' | 'update' | 'delete';
    path: string;
    requestResourceData?: any;
};

// Specialized error for Firestore permission issues
export class FirestorePermissionError extends Error {
  public operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  public path: string;
  public resource?: any;

  constructor(context: FirestorePermissionErrorContext) {
    super(`Firestore permission denied for ${context.operation} on ${context.path}`);
    this.name = 'FirestorePermissionError';
    this.operation = context.operation;
    this.path = context.path;
    this.resource = context.requestResourceData;
  }
}
