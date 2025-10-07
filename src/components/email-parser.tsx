'use client';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { parseApplicationEmail, type ParseApplicationEmailOutput } from '@/ai/flows/parse-application-email';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function EmailParser() {
  const [emailText, setEmailText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ParseApplicationEmailOutput | null>(null);
  const { toast } = useToast();

  const handleParse = async () => {
    if (!emailText.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Email content cannot be empty.',
      });
      return;
    }
    setIsParsing(true);
    setParsedData(null);
    try {
      const result = await parseApplicationEmail({ rawText: emailText });
      setParsedData(result);
      toast({
        title: 'Email Parsed!',
        description: 'Review the extracted details below.',
      });
    } catch (error) {
      console.error('Failed to parse email:', error);
      toast({
        variant: 'destructive',
        title: 'Parsing Failed',
        description: 'Could not extract details from the email. Please try adding it manually.',
      });
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <Textarea
          placeholder="Paste your forwarded email content here..."
          value={emailText}
          onChange={(e) => setEmailText(e.target.value)}
          rows={15}
        />
        <Button onClick={handleParse} disabled={isParsing}>
          {isParsing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Parsing...
            </>
          ) : (
            'Parse Email'
          )}
        </Button>
      </div>
      <div>
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle>Parsed Details</CardTitle>
            <CardDescription>
              Review the details extracted by the AI. You can add this to your applications list.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isParsing && (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            {!isParsing && parsedData && (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-3">
                  <span className="font-semibold text-muted-foreground">Company</span>
                  <span className="col-span-2">{parsedData.company || 'N/A'}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="font-semibold text-muted-foreground">Job Title</span>
                  <span className="col-span-2">{parsedData.title || 'N/A'}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="font-semibold text-muted-foreground">Applied At</span>
                  <span className="col-span-2">{parsedData.appliedAt ? new Date(parsedData.appliedAt).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="font-semibold text-muted-foreground">URL</span>
                  <span className="col-span-2 truncate">{parsedData.url || 'N/A'}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="font-semibold text-muted-foreground">App ID</span>
                  <span className="col-span-2">{parsedData.applicationId || 'N/A'}</span>
                </div>
                <Button className="mt-4 w-full" disabled={!parsedData.company}>Add to Applications</Button>
              </div>
            )}
            {!isParsing && !parsedData && (
                <div className="flex items-center justify-center h-48">
                    <p className="text-muted-foreground">Parsed data will appear here.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
