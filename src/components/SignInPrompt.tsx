
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogIn } from 'lucide-react';

export const SignInPrompt: React.FC = () => {
  const { user, signInWithGoogle } = useAuth();

  if (user) return null;

  return (
    <Card className="mb-6 border-dashed">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <LogIn className="h-5 w-5" />
          Sign in to unlock more features
        </CardTitle>
        <CardDescription>
          Sign in with Google to generate shareable links and save your brand guides
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Button onClick={signInWithGoogle} className="w-full sm:w-auto">
          Sign in with Google
        </Button>
      </CardContent>
    </Card>
  );
};
