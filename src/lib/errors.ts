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

// Specialized error for Firestore permission issues
export class FirestorePermissionError extends Error {
  public operation: 'read' | 'write' | 'delete' | 'list';
  public path: string;
  public resource?: any;

  constructor(
    operation: 'read' | 'write' | 'delete' | 'list',
    path: string,
    originalError: any,
    resource?: any
  ) {
    super(`Firestore permission denied for ${operation} on ${path}`);
    this.name = 'FirestorePermissionError';
    this.operation = operation;
    this.path = path;
    this.resource = resource;
    
    // It's often helpful to keep the original error
    Object.defineProperty(this, 'originalError', {
      value: originalError,
      enumerable: false
    });
  }
}