'use client';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter, FirestorePermissionError } from '@/lib/errors';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      console.log('Caught permission error:', error);
      toast({
        variant: 'destructive',
        duration: 20000, // Keep it open longer
        title: 'Firestore Security Rules Error',
        description: (
          <div className="mt-2 w-full">
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Permission Denied</AlertTitle>
              <AlertDescription className="font-mono text-xs">
                <p className="break-words">
                  <strong>Operation:</strong> {error.operation}
                </p>
                <p className="break-words">
                  <strong>Path:</strong> {error.path}
                </p>
                {error.resource && (
                    <p className="mt-2 break-words">
                        <strong>Resource Data:</strong>
                        <pre className="mt-1 w-full text-wrap rounded-md bg-muted p-2">
                           <code>{JSON.stringify(error.resource, null, 2)}</code>
                        </pre>
                    </p>
                )}
              </AlertDescription>
            </Alert>
          </div>
        ),
      });
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      // Clean up the listener, though with a singleton emitter it's not strictly necessary
    };
  }, [toast]);

  return null; // This component doesn't render anything
}
